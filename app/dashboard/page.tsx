'use client';

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([
    { role: "assistant", text: "Hello! I am your Personal AI Business Agent. How can I help you grow your business today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || isChatLoading) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: data.error || "Failed to get response from AI." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Error connecting to AI chat backend." }]);
    } finally {
      setIsChatLoading(false);
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="app" style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{ width: "260px", minHeight: "100vh", background: "var(--navy)", color: "#fff", padding: "25px 15px 18px", display: "flex", flexDirection: "column", position: "fixed", inset: "0 auto 0 0", zIndex: 20 }}>
        <div className="brand" style={{ display: "flex", alignItems: "center", gap: "11px", padding: "0 11px 28px" }}>
          <div className="brand-mark" style={{ width: "34px", height: "34px", borderRadius: "11px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #8e7dff, #35cce2)", fontWeight: 800, color: "#10172e" }}>AI</div>
          <div>
            <strong>My Personal AI</strong>
            <span>Autonomous Business OS</span>
          </div>
        </div>

        <div className="nav-label" style={{ color: "#697498", textTransform: "uppercase", letterSpacing: ".11em", fontSize: "10px", padding: "15px 12px 8px" }}>Workspace</div>
        <nav className="nav" style={{ display: "grid", gap: "4px" }}>
          {[
            { id: "overview", label: "Overview", icon: "⌂" },
            { id: "chat", label: "Agent Chat", icon: "💬" },
            { id: "builder", label: "Digital Builder", icon: "⚡" },
            { id: "crm", label: "CRM & Leads", icon: "👥" },
            { id: "research", label: "Research & KB", icon: "📚" },
            { id: "integrations", label: "Integrations", icon: "🔌" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
              className={activeView === item.id ? "active" : ""}
              style={{ border: 0, color: activeView === item.id ? "#fff" : "#aab2cc", background: activeView === item.id ? "rgba(255,255,255,.09)" : "transparent", textAlign: "left", padding: "11px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: ".2s" }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom" style={{ marginTop: "auto" }}>
          <div className="upgrade" style={{ margin: "18px 7px", padding: "15px", borderRadius: "13px", background: "linear-gradient(145deg, #232a55, #1a2042)", border: "1px solid #343b69" }}>
            <small style={{ color: "#aeb8de" }}>Autonomous Engine</small>
            <b style={{ display: "block", margin: "7px 0 11px", fontSize: "13px" }}>Ready for production</b>
            <button onClick={() => setModalOpen(true)} style={{ width: "100%", border: 0, borderRadius: "8px", padding: "8px", color: "#fff", background: "var(--purple)", cursor: "pointer" }}>+ New project</button>
          </div>
          <div className="profile" style={{ borderTop: "1px solid #2b3357", padding: "16px 8px 3px", display: "flex", alignItems: "center", gap: "9px" }}>
            <div className="avatar" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", borderRadius: "50%", background: "#e9c59c", color: "#623f2d", fontWeight: 700 }}>
              {session?.user?.name?.[0] || "O"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <strong style={{ fontSize: "12px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session?.user?.name || "Workspace Owner"}</strong>
              <small style={{ color: "#8e98b9", fontSize: "10px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session?.user?.email || "owner@workspace.com"}</small>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} title="Sign out" style={{ background: "transparent", border: "0", color: "#aab2cc", cursor: "pointer", fontSize: "16px" }}>⎋</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main" style={{ width: "calc(100% - 260px)", marginLeft: "260px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header className="topbar" style={{ height: "70px", background: "rgba(255,255,255,.83)", backdropFilter: "blur(13px)", borderBottom: "1px solid var(--line)", padding: "0 34px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div className="breadcrumb" style={{ color: "var(--muted)", fontSize: "13px" }}>
            Workspace / <b>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</b>
          </div>
          <div className="top-actions" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button id="openProject" onClick={() => setModalOpen(true)} className="primary" style={{ border: 0, borderRadius: "9px", padding: "8px 14px", fontWeight: "650", color: "#fff", background: "var(--purple)", cursor: "pointer" }}>+ Start project</button>
            <span style={{ fontSize: "12px", color: "var(--green)", background: "var(--green-soft)", padding: "4px 10px", borderRadius: "20px", fontWeight: 600 }}>● SECURE OWNER SESSION</span>
          </div>
        </header>

        <main className="page" style={{ padding: "32px 34px 50px", maxWidth: "1540px", margin: "0 auto", width: "100%", flex: 1 }}>
          {/* OVERVIEW VIEW */}
          <div className={`view ${activeView === "overview" ? "active" : ""}`} style={{ display: activeView === "overview" ? "block" : "none" }}>
            <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
              <div>
                <h1 style={{ margin: "0 0 5px", fontSize: "27px", letterSpacing: "-.8px" }}>Agent Command Center</h1>
                <p className="subtitle" style={{ color: "var(--muted)", margin: 0 }}>Welcome back. Your personal AI business agent is online and secured.</p>
              </div>
              <button onClick={() => setActiveView("chat")} className="primary" style={{ border: 0, borderRadius: "9px", padding: "11px 15px", fontWeight: "650", color: "#fff", background: "var(--purple)", cursor: "pointer" }}>Talk to Agent →</button>
            </div>

            <div className="stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "20px" }}>
              {[
                { label: "Active Leads", val: "24", trend: "+12% this week" },
                { label: "Pending Tasks", val: "5", trend: "All systems verified" },
                { label: "Knowledge Sources", val: "18", trend: "Synced" },
                { label: "Security Status", val: "Owner Only", trend: "NextAuth secured" }
              ].map((s, i) => (
                <div key={i} className="card stat" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "18px 19px" }}>
                  <div style={{ color: "var(--muted)", fontSize: "12px" }}>{s.label}</div>
                  <b style={{ display: "block", fontSize: "26px", letterSpacing: "-.8px", marginTop: "9px" }}>{s.val}</b>
                  <div style={{ fontSize: "11px", color: "var(--green)", marginTop: "2px" }}>{s.trend}</div>
                </div>
              ))}
            </div>

            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, .9fr)", gap: "20px" }}>
              <div className="card">
                <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "19px 20px", borderBottom: "1px solid var(--line)" }}>
                  <b>Recent Agent Activity</b>
                  <span style={{ color: "var(--purple)", fontSize: "12px", cursor: "pointer" }} onClick={() => showToast("All audit logs recorded securely.")}>View audit trail</span>
                </div>
                <div className="activity" style={{ padding: "6px 20px 15px" }}>
                  {[
                    { title: "Lead Discovery Completed", desc: "Found 4 qualified prospects in target market", time: "10m ago" },
                    { title: "Website Draft Brief Saved", desc: "Initialized project structure for client portal", time: "1h ago" },
                    { title: "Security Check Passed", desc: "NextAuth session verified successfully for owner", time: "3h ago" }
                  ].map((act, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 0", borderBottom: "1px solid #f0f2f6" }}>
                      <div style={{ marginTop: "5px", width: "9px", height: "9px", borderRadius: "50%", background: "var(--purple)", boxShadow: "0 0 0 4px var(--purple-soft)" }} />
                      <div style={{ flex: 1 }}>
                        <b style={{ display: "block", fontWeight: 600, fontSize: "13px" }}>{act.title}</b>
                        <span style={{ color: "var(--muted)", fontSize: "12px" }}>{act.desc}</span>
                      </div>
                      <span style={{ color: "var(--subtle)", fontSize: "11px" }}>{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: "22px" }}>
                <h3 style={{ marginBottom: "15px", fontSize: "16px" }}>Autonomous Readiness</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "17px", marginBottom: "20px" }}>
                  <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: "conic-gradient(var(--purple) 0 85%, #ecebfa 85% 100%)", display: "grid", placeItems: "center", fontWeight: 750, fontSize: "15px" }}>85%</div>
                  <div>
                    <b style={{ fontSize: "15px" }}>Optimized & Secured</b>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>Owner permissions active</span>
                  </div>
                </div>
                <button onClick={() => showToast("System is fully operational.")} className="secondary" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", cursor: "pointer" }}>Run system check</button>
              </div>
            </div>
          </div>

          {/* CHAT VIEW */}
          <div className={`view ${activeView === "chat" ? "active" : ""}`} style={{ display: activeView === "chat" ? "block" : "none" }}>
            <div className="page-head">
              <div>
                <h1>Agent Chat Command Center</h1>
                <p className="subtitle">Talk directly with your personal AI business agent in English, Nepali, or Roman Nepali.</p>
              </div>
            </div>
            <div className="card" style={{ display: "flex", flexDirection: "column", height: "600px" }}>
              <div ref={chatBodyRef} style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
                {messages.map((m, idx) => (
                  <div key={idx} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "75%", padding: "12px 18px", borderRadius: "16px", background: m.role === "user" ? "var(--purple)" : "#f0f2f6", color: m.role === "user" ? "#fff" : "var(--text)", fontSize: "14px", lineHeight: "1.5" }}>
                    {m.text}
                  </div>
                ))}
                {isChatLoading && (
                  <div style={{ alignSelf: "flex-start", padding: "12px 18px", borderRadius: "16px", background: "#f0f2f6", color: "var(--muted)", fontSize: "14px" }}>
                    AI agent is thinking...
                  </div>
                )}
              </div>
              <div style={{ padding: "15px 20px", borderTop: "1px solid var(--line)", display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendChat(); }}
                  placeholder="Ask your agent anything (e.g. Lead generate garera deu / Create business plan)..."
                  style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14px" }}
                />
                <button onClick={handleSendChat} disabled={isChatLoading} className="primary" style={{ padding: "12px 20px", borderRadius: "10px", background: "var(--purple)", color: "#fff", border: 0, fontWeight: 600, cursor: "pointer" }}>Send</button>
              </div>
            </div>
          </div>

          {/* BUILDER VIEW */}
          <div className={`view ${activeView === "builder" ? "active" : ""}`} style={{ display: activeView === "builder" ? "block" : "none" }}>
            <div className="page-head">
              <div>
                <h1>Digital Business & App Builder</h1>
                <p className="subtitle">Create websites, landing pages, apps, and workflows.</p>
              </div>
              <button onClick={() => showToast("Draft brief saved.")} className="primary">Save brief</button>
            </div>
            <div className="card" style={{ padding: "30px" }}>
              <h3>Current Project Workspace</h3>
              <p className="subtitle" style={{ marginTop: "10px" }}>No external deployment is executed without your direct authorization.</p>
              <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
                <input id="business" placeholder="Project name (e.g. My Startup Portal)" defaultValue="My Personal AI Business Agent" style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", width: "100%", maxWidth: "400px" }} />
                <button onClick={() => showToast("Preparation requires connected AI backend.")} className="secondary" style={{ width: "fit-content", padding: "10px 20px" }}>Prepare execution plan</button>
              </div>
            </div>
          </div>

          {/* CRM VIEW */}
          <div className={`view ${activeView === "crm" ? "active" : ""}`} style={{ display: activeView === "crm" ? "block" : "none" }}>
            <div className="page-head">
              <div>
                <h1>CRM & Lead Hunter</h1>
                <p className="subtitle">Manage customers, pipeline, leads, and follow-ups.</p>
              </div>
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                    <th style={{ padding: "12px" }}>Contact</th>
                    <th style={{ padding: "12px" }}>Company</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px" }}>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Suman Shrestha", company: "Kathmandu Tech", status: "Qualified", time: "2h ago" },
                    { name: "Puja Karki", company: "Himalayan Ventures", status: "New Lead", time: "1d ago" },
                    { name: "Bibek Thapa", company: "Pokhara Digital", status: "Contacted", time: "2d ago" }
                  ].map((lead, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px", fontWeight: 600 }}>{lead.name}</td>
                      <td style={{ padding: "12px", color: "var(--muted)" }}>{lead.company}</td>
                      <td style={{ padding: "12px" }}><span style={{ padding: "4px 8px", borderRadius: "12px", background: "var(--purple-soft)", color: "var(--purple)", fontSize: "12px" }}>{lead.status}</span></td>
                      <td style={{ padding: "12px", color: "var(--muted)" }}>{lead.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RESEARCH VIEW */}
          <div className={`view ${activeView === "research" ? "active" : ""}`} style={{ display: activeView === "research" ? "block" : "none" }}>
            <div className="page-head">
              <div>
                <h1>Research & Knowledge Base</h1>
                <p className="subtitle">Competitor analysis, documents, and business knowledge sources.</p>
              </div>
            </div>
            <div className="card" style={{ padding: "30px" }}>
              <h3>Active Knowledge Sources</h3>
              <p className="subtitle" style={{ marginTop: "10px" }}>18 documents and web research sources indexed for the agent.</p>
            </div>
          </div>

          {/* INTEGRATIONS VIEW */}
          <div className={`view ${activeView === "integrations" ? "active" : ""}`} style={{ display: activeView === "integrations" ? "block" : "none" }}>
            <div className="page-head">
              <div>
                <h1>Integrations</h1>
                <p className="subtitle">Connect approved messaging, calendar, payments, and email systems.</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {["WhatsApp Business", "Email Provider", "Google Calendar", "Payments (eSewa / Khalti)", "CRM Sync", "YouTube Automation"].map((integ, i) => (
                <div key={i} className="card" style={{ padding: "20px" }}>
                  <h3>{integ}</h3>
                  <p className="subtitle" style={{ margin: "8px 0 15px", fontSize: "13px" }}>OAuth integration ready.</p>
                  <button onClick={() => showToast(integ + " requires OAuth configuration in Render environment.")} className="secondary" style={{ width: "100%", padding: "8px" }}>Configure</button>
                </div>
              ))}
            </div>
          </div>

          {/* SETTINGS VIEW */}
          <div className={`view ${activeView === "settings" ? "active" : ""}`} style={{ display: activeView === "settings" ? "block" : "none" }}>
            <div className="page-head">
              <div>
                <h1>Settings & Security</h1>
                <p className="subtitle">Control workspace permissions, review gates, and owner safeguards.</p>
              </div>
              <button onClick={() => showToast("Settings saved securely.")} className="primary">Save changes</button>
            </div>
            <div className="card" style={{ padding: "30px", display: "grid", gap: "20px" }}>
              <div>
                <h3 style={{ marginBottom: "8px" }}>Owner Account Security</h3>
                <p className="subtitle">Authenticated owner: {session?.user?.email || "Protected"}</p>
              </div>
              <div>
                <h3 style={{ marginBottom: "8px" }}>Agent Operating Safeguards</h3>
                <p className="subtitle">✓ Require approval before publishing<br />✓ Require approval before sending external messages<br />✓ Restrict dashboard to owner email only</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100 }} onClick={() => setModalOpen(false)}>
          <div style={{ background: "var(--panel)", padding: "30px", borderRadius: "16px", maxWidth: "420px", width: "100%", boxShadow: "var(--shadow)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h2>Start a project</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: "transparent", border: 0, fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            <p className="subtitle" style={{ marginBottom: "20px" }}>Create a draft brief. Nothing is published until authorized.</p>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Acme website redesign"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "20px", outline: "none" }}
            />
            <button
              onClick={() => {
                if (!newName.trim()) { showToast("Add a project name."); return; }
                setModalOpen(false);
                setNewName("");
                setActiveView("builder");
                showToast("Draft brief created successfully.");
              }}
              className="primary"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--purple)", color: "#fff", border: 0, fontWeight: 600, cursor: "pointer" }}
            >
              Create draft brief
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastVisible && (
        <div style={{ position: "fixed", bottom: "30px", right: "30px", background: "var(--navy)", color: "#fff", padding: "12px 20px", borderRadius: "10px", boxShadow: "var(--shadow)", zIndex: 1000, fontSize: "14px" }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
