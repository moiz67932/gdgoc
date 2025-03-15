// components/SignUp/SignUp.jsx
export default function Signup() {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        <input type="email" placeholder="Email" className="block w-full p-2 mb-2 border rounded" />
        <input type="password" placeholder="Password" className="block w-full p-2 mb-4 border rounded" />
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full">
          Register
        </button>
      </div>
    );
  }
  