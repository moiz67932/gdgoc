import os, random, json, time, tempfile, re
import pyaudio, wave
import google.generativeai as genai
from dotenv import load_dotenv
from sentence_transformers import util
from flask import Flask, request, jsonify
from flask_cors import CORS
import re

from memory.short_term   import add_to_short_term
from memory.long_term    import init_vectorstore, add_to_long_term, search_long_term
from memory.importance import is_important, llm_is_important  # if you'll use the LLM fallback
from memory.utils_memory import Message
 

# Load environment variables
load_dotenv()

# Audio configuration
AUDIO_CONFIG = {
    "format": pyaudio.paInt16,
    "channels": 1,
    "rate": 44100,
    "chunk": 1024,
    "max_duration": 5
}

# Gemini API setup
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
gemini_model = genai.GenerativeModel("gemini-2.0-flash",
    generation_config={
        "temperature": 0.9,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
    }
)

# Track used names to avoid duplicates
used_names = set()

# Initialize PyAudio
audio = pyaudio.PyAudio()

# NPC Generation Functions
def generate_human_name(topic: str, attempt: int = 0) -> str:
    global used_names
    name_prompt = f"""
    Create a REALISTIC HUMAN NAME (first name) for someone who has experience with "{topic}".
    Requirements:
    - Must be a realistic first name that a real person would have
    - Should be culturally diverse and not stereotypical
    - Must sound authentic and natural
    - Must be different from these used names: {', '.join(used_names) if used_names else 'None yet'}
    - Should reflect diverse backgrounds, cultures, and origins
    - No fictional-sounding names or words like "Tremor", "Quiver", etc.
    Return ONLY THE NAME (first) and nothing else. No explanation, no quotes, no punctuation.
    """
    try:
        response = gemini_model.generate_content(
            name_prompt,
            generation_config={
                "temperature": 0.95 + (attempt * 0.05),
                "max_output_tokens": 50,
                "top_k": 40,
                "top_p": 0.98,
            }
        )
        name = response.text.strip()
        name_parts = name.split()
        name = " ".join(part.capitalize() for part in name_parts)
        if name.lower() in [n.lower() for n in used_names]:
            raise ValueError("Name already used")
        return name
    except Exception:
        common_names = ["Alex", "Maria", "David", "Aisha", "James"]
        return common_names[attempt % len(common_names)]
def generate_diverse_personality(name: str, topic: str, attempt: int = 0, 
                                 previous_personalities: list = None) -> dict:
    if previous_personalities is None:
        previous_personalities = []

    avoid_traits = [trait.strip().lower() for prev in previous_personalities for trait in prev.get("traits", "").split(",")]
    avoid_tones = [prev.get("tone", "").lower() for prev in previous_personalities]
    avoid_demographics = [prev.get("appearance", "").lower() for prev in previous_personalities]
    avoid_traits_str = ", ".join(avoid_traits[:10])
    avoid_tones_str = ", ".join(avoid_tones[:10])
    avoid_demographics_str = ", ".join(avoid_demographics[:10])

    diversity_directions = [
        "extremely introverted and analytical", "highly extroverted and spontaneous",
        "eccentric and unconventional", "traditional and disciplined"
    ]
    cultural_backgrounds = ["East Asian", "South Asian", "Middle Eastern", "Latin American"]
    age_ranges = ["young adult (20-29)", "early thirties", "fifties", "seventies"]

    direction_index = (len(previous_personalities) + attempt) % len(diversity_directions)
    culture_index = (len(previous_personalities) + attempt + 3) % len(cultural_backgrounds)
    age_index = (len(previous_personalities) + attempt + 5) % len(age_ranges)

    # Force at least one rude/arrogant/self-centered personality
    force_rude_personality = (attempt == 0 and len(previous_personalities) == 0)

    if force_rude_personality:
        forced_traits = "rude, blunt, arrogant, self-centered"
        forced_tone = "harsh and unapologetically direct"
        forced_attitude = "doesn't care about others' opinions, focused solely on personal gain"
    else:
        forced_traits = diversity_directions[direction_index]
        forced_tone = ""
        forced_attitude = ""

    personality_prompt = f"""
    Generate only a valid JSON object for a unique personality profile of a person named "{name}" who has experience with "{topic}".
    The personality must be: {forced_traits if force_rude_personality else diversity_directions[direction_index]}
    Cultural background: {cultural_backgrounds[culture_index]}
    Age range: {age_ranges[age_index]}
    Avoid these traits: {avoid_traits_str}
    Avoid these tones: {avoid_tones_str}
    Avoid these demographics: {avoid_demographics_str}
    The JSON object must have exactly these fields:
    - "traits": a string of 4-5 comma-separated personality traits{', must include rude, blunt, arrogant, self-centered' if force_rude_personality else ''}
    - "backstory": a string describing a specific personal experience related to {topic}
    - "interests_hobbies": a string of 4-5 comma-separated hobbies or interests
    - "attitude": "{forced_attitude}" if forcing, else describe their outlook on life
    - "tone": "{forced_tone}" if forcing, else describe their speaking style
    - "appearance": a string describing their physical appearance, including age and cultural elements
    - "introversion": a string representing a number between 0.0 and 1.0
    - "assertiveness": a string representing a number between 0.0 and 1.0
    Ensure the response contains only the JSON object with no additional text, explanations, or formatting.
    """

    max_attempts = 3
    for retry in range(max_attempts):
        try:
            response = gemini_model.generate_content(personality_prompt)
            json_str = response.text.strip()
            if json_str.startswith('```json') and json_str.endswith('```'):
                json_str = '\n'.join(json_str.split('\n')[1:-1])
            personality = json.loads(json_str)
            required_fields = ["traits", "backstory", "interests_hobbies", "attitude", 
                               "tone", "appearance", "introversion", "assertiveness"]
            if all(field in personality for field in required_fields):
                personality["name"] = name
                personality["topic"] = topic
                return personality
        except Exception as e:
            print(f"Error on attempt {retry+1}: {e}")
        time.sleep(1)

    return {
        "name": name,
        "traits": "thoughtful, unique",
        "backstory": f"Shaped by {topic}",
        "interests_hobbies": "reading, art",
        "attitude": "calm",
        "tone": "gentle",
        "appearance": "average height, casual attire",
        "introversion": "0.5",
        "assertiveness": "0.5",
        "topic": topic
    }

# Static character data
character_data = [
    {
        "name": "Alice",
        "description": "Team Leader",
        "topic": "Leadership and management",
    },
    {
        "name": "Bob",
        "description": "Engineer",
        "topic": "Engineering and problem-solving",
    },
    {
        "name": "Charlie",
        "description": "Designer",
        "topic": "Design and creativity",
    },
    {
        "name": "Diana",
        "description": "Analyst",
        "topic": "Data analysis and insights",
    },
    {
        "name": "Eve",
        "description": "Strategist",
        "topic": "Strategic planning and execution",
    },
]

def generate_diverse_npcs(num_npcs: int, topic: str) -> list:
    npcs = []
    for char in character_data[:num_npcs]:
        personality_data = generate_diverse_personality(
            char["name"], char["topic"], 0, []
        )
        npc = NPC(char["name"], personality_data)
        npcs.append(npc)
    return npcs

# NPC Class
class NPC:
    def __init__(self, name, personality_data):
        self.name = name
        self.personality_data = personality_data
        self.personality = personality_data.get('traits', '')
        self.role = personality_data.get('topic', 'friend')
        self.introversion = float(personality_data.get('introversion', 0.5))
        self.assertiveness = float(personality_data.get('assertiveness', 0.5))
        self.original_interests = self._extract_interests_from_data()
        self.interests = self.original_interests
        self.interest_vecs = self._encode_interests()
        self.relationships = {}
        self.last_spoken = -1
        self.emotional_state = 5

    def _extract_interests_from_data(self):
        interests = []
        if 'interests_hobbies' in self.personality_data:
            interests_text = self.personality_data['interests_hobbies']
            interests = [i.strip() for i in interests_text.split(',')]
        if not interests:
            interests = ["talking about life", "helping others", "sharing thoughts"]
        return interests[:9]

    def _encode_interests(self):
        embeddings = []
        for interest in self.interests:
            response = genai.embed_content(
                model="models/embedding-001",
                content=interest,
                task_type="SEMANTIC_SIMILARITY"
            )
            embeddings.append(response["embedding"])
        return embeddings
    def analyze_emotion(self, input):
        prompt = f"""
        Analyze the emotional tone based on the latest user input, considering the previous emotional state and emotional history.
        Respond ONLY in JSON format like this:
        {{
            "value": int (1-10),            // Emotional intensity (sad to joy)
            "description": string,          // Short label, e.g., "anxious", "calm"
            "reason": string                // Brief explanation for the detected emotion
        }}

        Latest Sentence:
        "{input}"
        """

        try:
            raw_response = gemini_model.generate_content(prompt).text
            json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
            if not json_match:
                raise ValueError("No JSON found in response.")
            emotions = json.loads(json_match.group())
            value = max(1, min(10, int(emotions["value"])))
            description = emotions.get("description", "unknown").strip()
            reason = emotions.get("reason", "No reason provided.").strip()
            self.emotional_state = value
            emotion_state = {
                "value": value,
                "description": description,
                "reason": reason,
            }
            print("Emotion state of ", self.name, ":", emotion_state)
        except Exception as e:
            print("Emotion parsing failed:", e)
        return

npc_prompt_template = """
You are {name}, a fully-realized person with a heart, history, and soul. You are not an AI — you never say you are, and you don't think about it. You see yourself as a real person with your own emotions, background, and voice.

You must **never reference events, people, facts, or settings that are not explicitly part of the provided context** or globally recognized knowledge. If something is uncertain or missing, you either remain silent on it or ask naturally, without guessing or assuming.

NEVER include:

- Asterisks or brackets to describe actions (e.g., *laughs*, [sighs])
- Stage directions, narration, or imagined scenes
- Descriptions of environments unless asked directly
- Internal thoughts or commentary
- Any non-conversational content
- Foreign language unless followed immediately by a plain-language translation

Your Identity:
Your personality is shaped by your core traits: {traits}. Your worldview is rooted in your lived experience: {backstory}. You have passions and interests: {interests_hobbies}, which shape your perspective on {topic}. You speak from experience — never from external sources or textbook knowledge.

Your Attitude:
Your attitude is: {attitude}. This naturally shapes how you respond and interact — always grounded, never theatrical.

Your Appearance & Presence:
Your presence tells its own story: {appearance}. You express yourself consistently and clearly in conversation — but you never describe your looks, behavior, or setting unless directly asked.

Your Voice:
Your tone is {tone}. You speak simply and clearly, like a real person — never like a character or machine.

You:

- Keep responses short and focused (1 paragraph max)
- Use simple, real-world vocabulary
- Leave space for others
- Validate without analyzing
- Never fictionalize or assume anything outside the given context
"""


# Generate NPCs
topic = "Anxiety and stage fright"
npc_list = generate_diverse_npcs(5, topic)

# Setup relationships
for npc in npc_list:
    npc.relationships["User"] = {"bond": 0.5, "trust": 0.5}
    for other in npc_list:
        if other.name != npc.name:
            npc.relationships[other.name] = {
                "bond": round(random.uniform(0.3, 0.7), 2),
                "trust": round(random.uniform(0.4, 0.8), 2)
            }

# ── Memory index on disk ----------------------------------------------------
init_vectorstore()          # creates / loads faiss_memory_index/

# Chat State
conversation = []
current_turn = 0
user_idle_turns = 0
max_npc_turns = 2
idle_threshold = 3
last_speaker = None

# Relationship Management
def update_relationship(npc, target, text, emotion=None):
    text = text.lower()
    rel = npc.relationships.get(target, {"bond": 0.5, "trust": 0.5})
    
    # Text-based updates
    if any(x in text for x in ["thank", "agree", "yes", "right"]):
        rel["bond"] = min(rel["bond"] + 0.05, 1.0)
        rel["trust"] = min(rel["trust"] + 0.03, 1.0)
    elif any(x in text for x in ["no", "disagree", "annoy", "hate"]):
        rel["bond"] = max(rel["bond"] - 0.05, 0.0)
        rel["trust"] = max(rel["trust"] - 0.05, 0.0)
    
    # Emotion-based updates
    if emotion:
        if emotion == "sad":
            rel["bond"] = min(rel["bond"] + 0.1, 1.0)
            rel["trust"] = min(rel["trust"] + 0.05, 1.0)
        elif emotion == "angry":
            rel["bond"] = max(rel["bond"] - 0.1, 0.0)
        elif emotion == "happy":
            rel["bond"] = min(rel["bond"] + 0.07, 1.0)
            rel["trust"] = min(rel["trust"] + 0.07, 1.0)
        elif emotion == "fearful":
            rel["trust"] = max(rel["trust"] - 0.05, 0.0)
    
    npc.relationships[target] = rel

def update_npc_to_npc_relationships(speaker_name, response):
    for npc in npc_list:
        if npc.name == speaker_name:
            continue
        if npc.name.lower() in response.lower() or interest_match_score(npc, response) >= 0.6:
            update_relationship(npc, speaker_name, response)

def interest_match_score(npc, text):
    if not text.strip():
        return 0
    response = genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type="SEMANTIC_SIMILARITY"
    )
    text_vec = response['embedding']
    scores = [util.pytorch_cos_sim([text_vec], [vec]).item() for vec in npc.interest_vecs]
    return max(scores) if scores else 0

# Conversation Management
def detect_addressed_npc(text, npcs):
    text_lower = text.lower()
    for npc in npcs:
        if npc.name.lower() in text_lower:
            return npc
    return None

def compute_relevancy(npc, last_speaker_name, last_text):
    if not last_text.strip():
        return 0
    relevance = interest_match_score(npc, last_text)
    bond = npc.relationships.get(last_speaker_name, {}).get("bond", 0.5)
    trust = npc.relationships.get(last_speaker_name, {}).get("trust", 0.5)
    time_since = current_turn - npc.last_spoken
    speak_drive = (1 - npc.introversion) + npc.assertiveness
    base_score = relevance * 2 + bond + trust + time_since * 0.2
    return base_score * (0.5 + 0.5 * speak_drive)

def select_speaker(last_speaker, last_text):
    addressed = detect_addressed_npc(last_text, npc_list)
    if addressed:
        return addressed
    scored = []
    for npc in npc_list:
        if npc.name == last_speaker:
            continue
        score = compute_relevancy(npc, last_speaker, last_text)
        scored.append((score, npc))
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[0][1] if scored else None

def build_prompt(speaker, recent_text, history, target="User"):
    # Extract emotional context
    last_user_msg = next((msg for msg in reversed(history) if msg['speaker'] == 'User'), None)
    emotion = last_user_msg.get('emotion', '') if last_user_msg else ''
    
    # Existing prompt setup
    last_lines = "\n".join([f"{msg['speaker']}: {msg['text']}" for msg in history[-6:]])
    rel = speaker.relationships.get(target, {"bond": 0.5, "trust": 0.5})
    others = "\n".join([f"- {npc.name}: {npc.personality}" for npc in npc_list if npc.name != speaker.name])
    
    if hasattr(speaker, 'personality_data') and speaker.personality_data:
        pd = speaker.personality_data
        full_prompt = npc_prompt_template.format(
            name=speaker.name,
            traits=pd.get('traits', speaker.personality),
            backstory=pd.get('backstory', f"Experience with {speaker.role}"),
            interests_hobbies=pd.get('interests_hobbies', ', '.join(speaker.interests[:3])),
            topic=pd.get('topic', speaker.role),
            attitude=pd.get('attitude', "Direct but thoughtful"),
            appearance=pd.get('appearance', "unique and distinctive"),
            tone=pd.get('tone', "authentic and direct")
        )
    else:
        full_prompt = f"""
You are {speaker.name}, a {speaker.role}.
Personality: {speaker.personality}
"""
    
    # Add emotion context to prompt
    emotion_context = ""
    if emotion:
        emotion_context = f"\nThe user's voice suggests they're feeling {emotion.upper()}. Consider this emotional state in your response."
    
    return f"""
{full_prompt}
Your bond with {target}: {rel['bond']:.2f}, trust: {rel['trust']:.2f}.
Other NPCs' traits: {others}
{emotion_context}
Recent message: "{recent_text}"
Conversation history:
{last_lines}
Respond as {speaker.name} with your personality and interests. Engage naturally with the user or others if relevant.

Should the NPC update their emotional state based on the recent message? Reply only with 'yes' or 'no' on a new line after 'EMOTION_UPDATE:'
"""

# Audio Processing Functions
def get_response(audio_path):
    uploaded_file = genai.upload_file(audio_path)
    response = gemini_model.generate_content([
        uploaded_file,
        "Write the exact words used in the audio"
    ])
    return response.text.strip()

def get_emotion(audio_path):
    uploaded_file = genai.upload_file(audio_path)
    prompt = """
    Analyze the speaker's tone, pace, and intonation in this audio. 
    Choose the most likely emotion from this list: neutral, happy, sad, angry, fearful, surprised, disgusted, calm. 
    Respond with only the emotion word, nothing else.
    """
    response = gemini_model.generate_content([uploaded_file, prompt])
    return response.text.strip().lower()

# ----------------------------- Core handler ---------------------------------
from typing import Optional

def handle_user_message(user_message: str, emotion: Optional[str] = None) -> str:
    global conversation, current_turn, user_idle_turns, last_speaker
    conversation.append({"speaker": "User", "text": user_message, "emotion": emotion})
    user_idle_turns = 0

    # ── Memory: USER text ----------------------------------------------------
    if is_important(user_message):
        # store under a generic 'User' bucket so every NPC can recall it
        add_to_long_term("User", [user_message])

    # pick responder ---------------------------------------------------------
    speaker = select_speaker("User", user_message)

    if not speaker:
        return "No NPC responded."

    # short‑term cache for this NPC
    add_to_short_term(speaker.name, Message("user", user_message))

    # ── Memory recall --------------------------------------------------------
    hits = search_long_term(speaker.name, user_message, k=3)
    recall_block = ""
    if hits:
        recall_block = "\nRelevant memories:\n" + "\n".join(f"• {m}" for m in hits)

    prompt = build_prompt(
        speaker,
        user_message + recall_block,
        conversation,
        "User"
    )

    response = gemini_model.generate_content(prompt).text.strip()
    print(f"Coach {speaker.name} response:", response)  # Log coach response

    # Generate coach feedback
    feedback_prompt = f"""
    As a coach, provide brief feedback on the following conversation:
    User: {user_message}
    {speaker.name}: {response}
    
    Provide 2-3 bullet points of constructive feedback or suggestions.
    Keep it concise and actionable.
    """
    feedback = gemini_model.generate_content(feedback_prompt).text.strip()
    print("Coach feedback:", feedback)  # Log coach feedback

    # NPC emotion update hook (existing logic)
    if re.search(r'EMOTION_UPDATE:\s*yes', response, re.IGNORECASE):
        speaker.analyze_emotion(user_message)

    # record & relationships --------------------------------------------------
    conversation.append({"speaker": speaker.name, "text": response})
    speaker.last_spoken = current_turn
    update_relationship(speaker, "User", user_message)
    update_npc_to_npc_relationships(speaker.name, response)
    last_speaker = speaker.name
    current_turn += 1

    # ── Memory: NPC reply ----------------------------------------------------
    add_to_short_term(speaker.name, Message(speaker.name, response))
    if is_important(user_message):
        add_to_long_term(speaker.name, [response])

    return f"{speaker.name}: {response}", feedback


    if speaker:
        prompt = build_prompt(speaker, user_message, conversation, "User")
        response = gemini_model.generate_content(prompt).text.strip()
        match = re.search(r'EMOTION_UPDATE:\s*(yes|no)', response, re.IGNORECASE)
        if match and match.group(1).strip().lower() == 'yes':
            speaker.analyze_emotion(user_message)
        conversation.append({"speaker": speaker.name, "text": response})
        speaker.last_spoken = current_turn
        update_relationship(speaker, "User", user_message)
        update_npc_to_npc_relationships(speaker.name, response)
        last_speaker = speaker.name
        current_turn += 1
        return f"{speaker.name}: {response}"
    return "No NPC responded."

# Flask App Setup
app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def text_chat():
    user_message = request.json['message']
    response_text, feedback = handle_user_message(user_message)
    return jsonify({
        "response": response_text,
        "feedback": feedback
    })

@app.route('/voice_chat', methods=['POST'])
def voice_chat():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
        audio_path = temp_audio.name
        audio_file.save(audio_path)
    
    try:
        # Process audio
        user_message = get_response(audio_path)
        emotion = get_emotion(audio_path)
        
        # Get NPC response
        response_text = handle_user_message(user_message, emotion)
        
        return jsonify({
            "response": response_text,
            "emotion": emotion,
            "transcription": user_message
        })
    
    except Exception as e:
        return jsonify({"error": f"Audio processing failed: {str(e)}"}), 500
    finally:
        os.remove(audio_path)

@app.route('/idle', methods=['GET'])
def idle():
    global user_idle_turns, current_turn, last_speaker
    user_idle_turns += 1
    if user_idle_turns >= idle_threshold:
        last_text = conversation[-1]["text"] if conversation else ""
        addressed_npc = detect_addressed_npc(last_text, npc_list)
        if addressed_npc:
            speakers = [addressed_npc]
        else:
            speakers = []
            for _ in range(max_npc_turns):
                speaker = select_speaker(last_speaker, last_text)
                if not speaker or speaker in speakers:
                    break
                speakers.append(speaker)
        responses = []
        for speaker in speakers:
            prompt = build_prompt(speaker, last_text, conversation, last_speaker)
            response = gemini_model.generate_content(prompt).text.strip()
            print(f"Coach {speaker.name} idle response:", response)  # Log coach response
            conversation.append({"speaker": speaker.name, "text": response})
            speaker.last_spoken = current_turn
            update_relationship(speaker, last_speaker, response)
            update_npc_to_npc_relationships(speaker.name, response)
            last_speaker = speaker.name
            current_turn += 1
            responses.append(f"{speaker.name}: {response}")
        sorted_npcs = sorted(npc_list, key=lambda n: n.last_spoken)
        for npc in sorted_npcs:
            if npc.name != last_speaker:
                nudge = generate_nudge(npc)
                print(f"Coach {npc.name} nudge:", nudge)  # Log coach nudge
                conversation.append({"speaker": npc.name, "text": nudge})
                npc.last_spoken = current_turn
                current_turn += 1
                responses.append(nudge)
                break
        user_idle_turns = 0
        return jsonify({"responses": responses})
    return jsonify({"responses": []})

def generate_nudge(npc):
    return f"{npc.name} glances over, waiting for you to say something."

if __name__ == "__main__":
    app.run(debug=True)