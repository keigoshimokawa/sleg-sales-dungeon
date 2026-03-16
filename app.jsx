const { useState, useEffect, useRef } = React;

// --- Mock Data ---

// Table A [マスタ_ステージ]
const masterStages = [
  { id: 's1', level: 'LEVEL3', name: 'ヒアリング（IN）: 最終決戦', isBoss: true, condition: 'インサイトを引き裂け' },
  { id: 's2', level: 'LEVEL3', name: 'ヒアリング（IN）: 深部への侵入', isBoss: false, condition: '潜在ニーズを5個引き出す' },
  { id: 's3', level: 'LEVEL2', name: 'ヒアリング（SP）: 問題解決の兆し', isBoss: true, condition: 'SPIN話法を完遂せよ' },
  { id: 's4', level: 'LEVEL2', name: 'ヒアリング（SP）: 共感と探求', isBoss: false, condition: 'SPINのSとPのみで進行' },
  { id: 's5', level: 'LEVEL1', name: '関係構築: 鉄壁の城門', isBoss: true, condition: '完全なる信頼関係の構築' },
  { id: 's6', level: 'LEVEL1', name: '関係構築: はじまりの村', isBoss: false, condition: '笑顔で雑談を3分実施' },
  { id: 's7', level: 'LEVEL0', name: '非言語コミュニケーション: 試練の門', isBoss: true, condition: '目線と姿勢による圧倒' },
  { id: 's8', level: 'LEVEL0', name: '非言語コミュニケーション: 基本の道', isBoss: false, condition: '相槌と声のトーンの調整' },
];

// Table B [データ_ユーザー進捗]
const initialUsers = [
  { id: 'u1', name: 'シモカワ (Logged In)', role: 'user', currentLevel: 'LEVEL1', currentStage: '関係構築: はじまりの村', exp: 120 },
  { id: 'u2', name: 'タナカ (Hero)', role: 'user', currentLevel: 'LEVEL3', currentStage: 'ヒアリング（IN）: 最終決戦', exp: 950 },
  { id: 'u3', name: 'ヤマダ (Rookie)', role: 'user', currentLevel: 'LEVEL0', currentStage: '非言語コミュニケーション: 基本の道', exp: 10 },
  { id: 'u4', name: 'サトウ (Elite)', role: 'admin', currentLevel: 'LEVEL2', currentStage: 'ヒアリング（SP）: 問題解決の兆し', exp: 540 },
];

// Table C [ログ_ロープレ履歴]
const initialLogs = [
  { 
    id: 1, date: '2026-03-13', target: 'シモカワ', partner: 'サトウ', type: '通常', passed: true,
    skills: { relation: 4, empathy: 3, hearing: 3, presentation: 2, closing: 2 },
    videoUrl: 'https://example.com/vid1', feedback: '声のトーンが良かった。次回はSPINを意識しよう。'
  },
  { 
    id: 2, date: '2026-03-10', target: 'シモカワ', partner: 'ヤマダ', type: 'ボス', passed: false,
    skills: { relation: 2, empathy: 2, hearing: 1, presentation: 1, closing: 1 },
    videoUrl: 'https://example.com/vid2', feedback: '緊張していた。関係構築からやり直そう。'
  }
];

// Table D [マスタ_ガチャ設定]
const gachaConfig = [
  { rarity: 'SSR', color: '#ff0055', personality: '怒りっぽい決裁者', weight: 10 },
  { rarity: 'SR', color: '#ffd700', personality: '論理的で冷徹なCTO', weight: 30 },
  { rarity: 'R', color: '#00ffcc', personality: '優柔不断な担当者', weight: 60 },
  { rarity: 'N', color: '#c0c0c0', personality: 'フレンドリーな一般社員', weight: 100 },
];

const LOGGED_IN_USER_NAME = 'シモカワ (Logged In)';


// --- Components ---

// Screen 1: Dungeon Map
const DungeonMap = ({ users, onBattleSelect }) => {
  // Group by level
  const levels = ['LEVEL3', 'LEVEL2', 'LEVEL1', 'LEVEL0'];
  
  const getExpColor = (exp) => {
    if (exp < 100) return 'var(--color-exp-green)';
    if (exp < 500) return 'var(--color-exp-yellow)';
    return 'var(--color-exp-red)';
  };

  const getExpWidth = (exp) => {
    return Math.min(100, Math.max(5, (exp % 1000) / 10)) + '%';
  };

  return (
    <div className="dungeon-map animation-fade-in">
      {levels.map(level => {
        const usersInLevel = users.filter(u => u.currentLevel === level);
        
        // Find stage info for header mapping
        const stageName = masterStages.find(s => s.level === level)?.name.split(':')[0] || 'Unknown';
        
        return (
          <div key={level} className="level-group glass-container" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 className="level-header">{level}：{stageName}</h2>
            
            <div className="card-grid">
              {usersInLevel.length === 0 ? (
                <div style={{color: '#666', fontStyle: 'italic'}}>この階層には誰もいません...</div>
              ) : (
                usersInLevel.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="card-header">
                      <span className="user-name">{user.name}</span>
                      {user.name === LOGGED_IN_USER_NAME && <span style={{fontSize:'0.8rem', color:'var(--color-primary)'}}> You</span>}
                    </div>
                    <div className="stage-name">📍 {user.currentStage}</div>
                    
                    <div style={{fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between'}}>
                      <span>総合EXP</span>
                      <span>{user.exp}</span>
                    </div>
                    
                    <div className="exp-container">
                      <div 
                        className="exp-bar" 
                        style={{ width: getExpWidth(user.exp), backgroundColor: getExpColor(user.exp) }}
                      ></div>
                    </div>
                    
                    <div className="card-footer">
                      <button 
                        className="btn-primary" 
                        onClick={() => onBattleSelect(user)}
                        disabled={user.name !== LOGGED_IN_USER_NAME}
                        style={{opacity: user.name !== LOGGED_IN_USER_NAME ? 0.3 : 1, cursor: user.name !== LOGGED_IN_USER_NAME ? 'not-allowed' : 'pointer'}}
                      >
                        ⚔️ 挑む
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Screen 2: Stats (My Page)
const StatsPage = ({ logs, users }) => {
  const chartRef = useRef(null);
  const user = users.find(u => u.name === LOGGED_IN_USER_NAME);
  
  useEffect(() => {
    // Generate Average Skills for Radar Chart
    let avgs = { relation: 0, empathy: 0, hearing: 0, presentation: 0, closing: 0 };
    if (logs.length > 0) {
      logs.forEach(log => {
        avgs.relation += log.skills.relation;
        avgs.empathy += log.skills.empathy;
        avgs.hearing += log.skills.hearing;
        avgs.presentation += log.skills.presentation;
        avgs.closing += log.skills.closing;
      });
      const len = logs.length;
      Object.keys(avgs).forEach(k => avgs[k] = (avgs[k] / len).toFixed(1));
    }

    const ctx = document.getElementById('radarChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    Chart.defaults.color = "rgba(255, 255, 255, 0.7)";
    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['関係構築', '共感賞賛', 'ヒアリング', 'プレゼン', 'クロージング'],
        datasets: [{
          label: 'Skill Level',
          data: [avgs.relation, avgs.empathy, avgs.hearing, avgs.presentation, avgs.closing],
          backgroundColor: 'rgba(0, 255, 204, 0.2)',
          borderColor: '#00ffcc',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#00ffcc',
          pointHoverBackgroundColor: '#00ffcc',
          pointHoverBorderColor: '#fff',
          borderWidth: 2,
        }]
      },
      options: {
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
            grid: { color: 'rgba(255, 255, 255, 0.2)' },
            pointLabels: { font: { family: "'Noto Sans JP'", size: 14 }, color: '#00ffcc' },
            ticks: {
              display: false,
              min: 0,
              max: 5,
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    }
  }, [logs]);

  return (
    <div className="stats-container animation-fade-in">
      <div className="radar-section glass-container">
        <h2 className="title-cyber" style={{color: 'var(--color-primary)'}}>SKILL RADAR</h2>
        <div style={{width: '100%', maxWidth: '400px', margin: '2rem 0'}}>
          <canvas id="radarChart"></canvas>
        </div>
        <div style={{textAlign: 'center', width: '100%', marginTop: 'auto'}}>
          <div style={{fontSize: '1.2rem', color: '#aaa'}}>TOTAL EXP</div>
          <div style={{fontSize: '3rem', fontFamily: 'var(--font-cyber)', color: 'var(--color-primary)', textShadow: '0 0 10px rgba(0,255,204,0.5)'}}>
            {user?.exp}
          </div>
        </div>
      </div>

      <div className="history-section glass-container">
        <h2 className="title-cyber" style={{color: 'var(--color-primary)', marginBottom: '1.5rem'}}>BATTLE HISTORY</h2>
        
        {logs.length === 0 ? (
          <div style={{color: '#666', fontStyle: 'italic', padding: '2rem'}}>データがありません...</div>
        ) : (
          <ul className="history-list">
            {logs.map(log => (
              <li key={log.id} className={`history-item ${log.type === 'ボス' ? 'boss-battle' : ''}`}>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '0.9rem', color: '#aaa'}}>{log.date}</div>
                  <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>VS {log.partner} <span style={{fontSize: '0.8rem', marginLeft: '0.5rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px'}}>{log.type}</span></div>
                  <div style={{fontSize: '0.9rem', marginTop: '0.5rem', color: log.passed ? 'var(--color-primary)' : 'var(--color-secondary)'}}>
                    {log.passed ? '◆ CLEAR' : '◇ FAILED'}
                  </div>
                  <div style={{fontSize: '0.85rem', marginTop: '0.5rem', color: '#ccc'}}>
                    💬 {log.feedback}
                  </div>
                </div>
                <div>
                  <a href={log.videoUrl} target="_blank" className="btn-primary" style={{textDecoration: 'none', display: 'inline-block', fontSize: '0.9rem'}}>
                    ▶録画を見る
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Screen 3: Dungeon Event (Battle)
const BattleScreen = ({ onBattleComplete }) => {
  const [gachaResult, setGachaResult] = useState(null);
  
  const [formData, setFormData] = useState({
    partner: '',
    type: '通常',
    passed: true,
    videoUrl: 'https://',
    feedback: '',
    skills: {
      relation: 3,
      empathy: 3,
      hearing: 3,
      presentation: 3,
      closing: 3
    }
  });

  // Roll Gacha on mount
  useEffect(() => {
    // simple weighted random
    const totalWeight = gachaConfig.reduce((acc, current) => acc + current.weight, 0);
    let rand = Math.random() * totalWeight;
    let selected = gachaConfig[gachaConfig.length - 1]; // fallback N
    
    for (const item of gachaConfig) {
      if (rand < item.weight) {
        selected = item;
        break;
      }
      rand -= item.weight;
    }
    
    // Add small delay for dramatic effect
    setTimeout(() => {
      setGachaResult(selected);
    }, 500);
  }, []);

  const handleSliderChange = (skill, val) => {
    setFormData({
      ...formData,
      skills: { ...formData.skills, [skill]: parseInt(val) }
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    onBattleComplete(formData);
  };

  const skillLabels = {
    relation: '関係構築',
    empathy: '共感賞賛',
    hearing: 'ヒアリング',
    presentation: 'プレゼン',
    closing: 'クロージング'
  };

  return (
    <div className="battle-container animation-fade-in">
      <div className="gacha-section glass-container" style={{padding: '2rem'}}>
        <h3 className="title-cyber" style={{textAlign: 'center', marginBottom: '2rem'}}>本日の顧客</h3>
        
        {!gachaResult ? (
          <div style={{height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{color: 'var(--color-primary)'}}>アクセス中...</div>
          </div>
        ) : (
          <div className="gacha-card" style={{border: `2px solid ${gachaResult.color}`}}>
            <div className="gacha-hologram-line"></div>
            <div style={{
              position: 'absolute', top: '10px', left: '10px', 
              fontFamily: 'var(--font-cyber)', color: gachaResult.color, 
              fontSize: '2rem', textShadow: `0 0 10px ${gachaResult.color}`
            }}>
              {gachaResult.rarity}
            </div>
            
            <div style={{marginTop: 'auto', padding: '1.5rem', textAlign: 'center', width: '100%', background: 'rgba(0,0,0,0.6)', borderTop: `1px solid ${gachaResult.color}`}}>
              <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{gachaResult.personality}</div>
              <div style={{fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem'}}>属性カラー: <span style={{color: gachaResult.color}}>■</span></div>
            </div>
          </div>
        )}
      </div>

      <div className="form-section glass-container">
        <h2 className="title-cyber" style={{marginBottom: '2rem', color: 'var(--color-primary)'}}>BATTLE EVALUATION</h2>
        <form onSubmit={submitForm}>
          
          <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
            <div style={{flex: 1}}>
              <label className="form-label">相手 (Roleplay Partner)</label>
              <input type="text" name="partner" className="form-control" required value={formData.partner} onChange={handleFormChange} placeholder="例: リーダー" />
            </div>
            <div style={{flex: 1}}>
              <label className="form-label">種別</label>
              <select name="type" className="form-control" value={formData.type} onChange={handleFormChange}>
                <option value="通常">通常</option>
                <option value="ボス">ボス</option>
              </select>
            </div>
          </div>

          <div style={{marginBottom: '2rem'}}>
            <h4 style={{borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '1rem'}}>スキル評価 (1 - 5)</h4>
            
            {Object.keys(skillLabels).map(key => (
              <div key={key} className="form-group" style={{display: 'flex', alignItems: 'center'}}>
                <div style={{width: '120px'}} className="form-label mb-0">{skillLabels[key]}</div>
                <div className="slider-container" style={{flex: 1}}>
                  <input 
                    type="range" min="1" max="5" step="1" 
                    value={formData.skills[key]}
                    onChange={(e) => handleSliderChange(key, e.target.value)}
                  />
                  <span className={`slider-value ${formData.skills[key] === 5 ? 'max' : ''}`}>
                    {formData.skills[key]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">合否</label>
            <select name="passed" className="form-control" value={formData.passed} onChange={(e) => handleFormChange({target: {name: 'passed', value: e.target.value === 'true'}})}>
              <option value="true">合格 (CLEAR)</option>
              <option value="false">不合格 (FAILED)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">録画URL</label>
            <input type="url" name="videoUrl" className="form-control" value={formData.videoUrl} onChange={handleFormChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">フィードバック</label>
            <textarea name="feedback" className="form-control" rows="3" value={formData.feedback} onChange={handleFormChange} required placeholder="改善点や良かった点..."></textarea>
          </div>

          <button type="submit" className="btn-danger" style={{width: '100%', padding: '1rem', fontSize: '1.2rem'}}>
            🚀 評価を送信する (SUBMIT)
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Main App Shell ---

const App = () => {
  const [currentView, setCurrentView] = useState('MAP'); // MAP, STATS, BATTLE
  const [users, setUsers] = useState(initialUsers);
  const [logs, setLogs] = useState(initialLogs);
  const [showToast, setShowToast] = useState(false);

  const startBattle = (user) => {
    setCurrentView('BATTLE');
  };

  const finishBattle = (formData) => {
    // 1. Add log
    const newLog = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      target: LOGGED_IN_USER_NAME.replace(' (Logged In)', ''),
      ...formData
    };
    
    setLogs([newLog, ...logs]);

    // 2. Add EXP to user
    const expGain = formData.passed ? (formData.type === 'ボス' ? 150 : 50) : 10;
    
    setUsers(users.map(u => {
      if (u.name === LOGGED_IN_USER_NAME) {
        // Mock stage advancement logic
        let newExp = u.exp + expGain;
        let newStage = u.currentStage;
        let newLevel = u.currentLevel;
        
        // Simple mock: if passed boss, advance level
        if (formData.passed && formData.type === 'ボス') {
           const levels = ['LEVEL0', 'LEVEL1', 'LEVEL2', 'LEVEL3'];
           const currentIndex = levels.indexOf(u.currentLevel);
           if (currentIndex < 3) {
             newLevel = levels[currentIndex + 1];
             const nextStageDefault = masterStages.find(s => s.level === newLevel && !s.isBoss);
             if (nextStageDefault) newStage = nextStageDefault.name;
           }
        }

        return { ...u, exp: newExp, currentLevel: newLevel, currentStage: newStage };
      }
      return u;
    }));

    // 3. Show Toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // 4. Return to map
    setCurrentView('MAP');
  };

  return (
    <React.Fragment>
      <header className="nav-header glass-container">
        <div>
          <h1 className="title-cyber" style={{margin: 0, fontSize: '1.5rem'}}>
            SLEG <span style={{color: 'var(--color-primary)'}}>SALES</span> DUNGEON
          </h1>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-btn ${currentView === 'MAP' ? 'active' : ''}`}
            onClick={() => setCurrentView('MAP')}
          >
            🗺️ MAP
          </button>
          <button 
            className={`nav-btn ${currentView === 'STATS' ? 'active' : ''}`}
            onClick={() => setCurrentView('STATS')}
          >
            📊 MY STATS
          </button>
        </div>
      </header>

      <main className="app-content">
        {currentView === 'MAP' && <DungeonMap users={users} onBattleSelect={startBattle} />}
        {currentView === 'STATS' && <StatsPage logs={logs} users={users} />}
        {currentView === 'BATTLE' && <BattleScreen onBattleComplete={finishBattle} />}
      </main>

      <div className={`toast ${showToast ? 'show' : ''}`}>
        🎉 レベルアップしよう！！ (SUCCESS)
      </div>
    </React.Fragment>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
