import { useState, useEffect } from 'react';
import { Send, Database, Terminal, Sparkles, Loader2, Code2, Clock, MapPin, Activity } from 'lucide-react';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const suggestions = [
    "How many employees are there in total?",
    "Show me the top 5 highest paid employees.",
    "Who works in the Data Science department?"
  ];

  const askAI = async (queryToRun: string) => {
    if (!queryToRun) return;
    setQuestion(queryToRun);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/ask-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryToRun }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Failed to connect to the backend server. Is Uvicorn running?" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      
      {/* Top Status Bar */}
      <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center pb-4 mb-8 border-b border-gray-800/50 text-xs md:text-sm text-gray-400 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" />
            {/* Formats the time to standard IST or local time */}
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-400" />
            <span>India</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="font-semibold tracking-wide uppercase text-xs">System Online</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4 pb-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-2 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
            Text2SQL Assistant
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Translate plain English into optimized PostgreSQL queries instantly using the power of Qwen2.5.
          </p>
        </div>
        
        {/* Input Card */}
        <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-2xl ring-1 ring-white/[0.02]">
          
          {/* Suggested Prompts */}
          <div className="flex flex-wrap gap-2 mb-6">
            {suggestions.map((sug, idx) => (
              <button 
                key={idx}
                onClick={() => askAI(sug)}
                className="text-sm px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300 transition-all text-gray-400 flex items-center gap-2"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askAI(question)}
              placeholder="Ask anything about your database..."
              className="w-full pl-6 pr-32 py-4 rounded-xl bg-gray-950/50 border border-gray-800 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg placeholder:text-gray-600 shadow-inner"
            />
            <button 
              onClick={() => askAI(question)}
              disabled={loading || !question}
              className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="hidden sm:inline">{loading ? 'Running' : 'Generate'}</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* SQL Query Output */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900/50">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h3 className="text-gray-300 font-semibold text-sm tracking-wider">AI GENERATED SQL</h3>
              </div>
              <div className="p-6 overflow-x-auto">
                <code className="text-lg text-green-400 font-mono whitespace-pre-wrap">
                  {result.ai_generated_sql || result.failed_sql}
                </code>
              </div>
            </div>

            {/* Database Results Table */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900/50">
                <Database className="w-4 h-4 text-blue-400" />
                <h3 className="text-gray-300 font-semibold text-sm tracking-wider">DATABASE RESULTS</h3>
              </div>
              
              <div className="p-0 overflow-x-auto max-h-[400px] overflow-y-auto">
                {result.error ? (
                  <div className="p-6 text-red-400 flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    <p>{result.error}</p>
                  </div>
                ) : result.database_results && result.database_results.length > 0 ? (
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <tbody>
                      {result.database_results.map((row: any[], rowIndex: number) => (
                        <tr 
                          key={rowIndex} 
                          className="border-b border-gray-800/50 hover:bg-blue-900/10 transition-colors"
                        >
                          {row.map((cell: any, cellIndex: number) => (
                            <td key={cellIndex} className="p-4 text-gray-300 border-r border-gray-800/30 last:border-0">
                              {cell !== null ? cell.toString() : <span className="text-gray-600 italic">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-gray-500 italic">No matching records found in the database.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;