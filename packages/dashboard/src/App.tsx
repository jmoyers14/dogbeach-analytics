import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, updateTRPCClient } from "./trpc";
import Projects from "./pages/Projects";

const ADMIN_SECRET_KEY = "analytics_admin_secret";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [inputSecret, setInputSecret] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const secret = inputSecret.trim();
        if (secret) {
            updateTRPCClient(secret);
            setIsLoggedIn(true);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setInputSecret("");
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Analytics Dashboard
                    </h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label
                                htmlFor="adminSecret"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Admin Secret
                            </label>
                            <input
                                id="adminSecret"
                                type="password"
                                value={inputSecret}
                                onChange={(e) => setInputSecret(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter admin secret"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
                <div className="min-h-screen bg-gray-50">
                    <nav className="bg-white shadow-sm border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Analytics Dashboard
                                </h1>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </nav>
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Projects />
                    </main>
                </div>
        </QueryClientProvider>
    );
}

export default App;
