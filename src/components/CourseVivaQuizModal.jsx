import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Sparkles, 
  Volume2, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getQuestionsForCertificate, evaluateVivaResult } from '../services/vivaQuizService';
import { updateCertificateRecord } from '../services/certificateService';

export const CourseVivaQuizModal = ({ isOpen, onClose, certificate, onVivaSuccess }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);

  const loadFreshQuestions = (count = questionCount) => {
    if (!certificate) return;
    const qList = getQuestionsForCertificate(certificate, count);
    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizFinished(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (certificate && isOpen) {
      loadFreshQuestions(5);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [certificate, isOpen]);

  if (!isOpen || !certificate || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const selectedChoice = selectedAnswers[currentIndex];
  const isAnswered = selectedChoice !== undefined;

  const handleSelectOption = (idx) => {
    if (isAnswered) return; // Prevent changing after selection
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: idx }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    if (scorePercent >= 70) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  const handleRetry = () => {
    loadFreshQuestions(questionCount);
  };

  const handleSaveVivaResult = async () => {
    setSaving(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correctCount++;
    });
    const scorePercent = Math.round((correctCount / questions.length) * 100);

    try {
      const updated = await updateCertificateRecord(certificate.id, {
        vivaScore: scorePercent,
        vivaStatus: scorePercent >= 70 ? 'PASSED' : 'FAILED',
        vivaPassedAt: new Date().toISOString(),
        vivaQuestionsTotal: questions.length,
        vivaQuestionsCorrect: correctCount
      });

      if (onVivaSuccess) {
        onVivaSuccess(updated);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save viva status:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSpeakQuestion = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${currentQ.question}. Option 1: ${currentQ.options[0]}. Option 2: ${currentQ.options[1]}. Option 3: ${currentQ.options[2]}. Option 4: ${currentQ.options[3]}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Compute final score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) correctCount++;
  });
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const evalResult = evaluateVivaResult(scorePercent);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '720px', 
          width: '95vw',
          background: '#090d16',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(14, 165, 233, 0.15)',
          color: '#f8fafc',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)'
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700 }}>
                  Course Mastery & Viva Exam
                </span>
                {currentQ?.topicLabel && (
                  <span style={{ 
                    background: 'rgba(56, 189, 248, 0.15)', 
                    border: '1px solid rgba(56, 189, 248, 0.3)', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.7rem', 
                    color: '#38bdf8', 
                    fontWeight: 600 
                  }}>
                    🏷️ {currentQ.topicLabel}
                  </span>
                )}
                <span style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1px 7px', borderRadius: '4px', fontSize: '0.7rem', color: '#cbd5e1' }}>
                  {certificate.issuer || 'Academic'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '3px 0 0' }}>
                {certificate.title}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose} 
            style={{ 
              color: '#94a3b8', 
              background: 'rgba(255, 255, 255, 0.06)', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '6px', 
              cursor: 'pointer' 
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {!quizFinished ? (
            <div>
              {/* Progress & Question Counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'inline-flex', gap: '3px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', marginRight: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionCount(5);
                        loadFreshQuestions(5);
                      }}
                      style={{
                        padding: '2px 7px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: 'none',
                        background: questions.length <= 5 ? '#0ea5e9' : 'transparent',
                        color: questions.length <= 5 ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                      title="5 Questions (Speed Demo)"
                    >
                      5 Qs
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionCount(10);
                        loadFreshQuestions(10);
                      }}
                      style={{
                        padding: '2px 7px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: 'none',
                        background: questions.length > 5 ? '#0ea5e9' : 'transparent',
                        color: questions.length > 5 ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                      title="10 Questions (Comprehensive Exam)"
                    >
                      10 Qs
                    </button>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8' }}>
                    Viva Question {currentIndex + 1} of {questions.length}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {questions.map((_, i) => (
                      <div 
                        key={i} 
                        style={{
                          width: '18px',
                          height: '5px',
                          borderRadius: '3px',
                          background: i === currentIndex 
                            ? '#38bdf8' 
                            : selectedAnswers[i] !== undefined 
                              ? (selectedAnswers[i] === questions[i].correctIndex ? '#10b981' : '#f43f5e')
                              : 'rgba(255, 255, 255, 0.15)'
                        }} 
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => loadFreshQuestions(questionCount)}
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Generate a completely new randomized set of viva questions from the pool"
                  >
                    <RotateCcw size={12} />
                    <span>New Questions</span>
                  </button>

                  <button 
                    onClick={handleSpeakQuestion}
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: isSpeaking ? '#38bdf8' : '#94a3b8',
                      background: isSpeaking ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isSpeaking ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Read question aloud using AI voice"
                  >
                    <Volume2 size={14} />
                    <span>{isSpeaking ? 'Speaking...' : '🎙️ Read Aloud'}</span>
                  </button>
                </div>
              </div>

              {/* Question Box */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.5, color: '#f1f5f9', fontWeight: 600, margin: 0 }}>
                  {currentQ.question}
                </p>
              </div>

              {/* Options Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedChoice === oIdx;
                  const isCorrect = oIdx === currentQ.correctIndex;
                  
                  let optStyle = {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    fontSize: '0.92rem',
                    lineHeight: 1.45,
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#e2e8f0'
                  };

                  if (isAnswered) {
                    if (isCorrect) {
                      optStyle.background = 'rgba(16, 185, 129, 0.15)';
                      optStyle.borderColor = '#10b981';
                      optStyle.color = '#34d399';
                      optStyle.boxShadow = '0 0 15px rgba(16, 185, 129, 0.2)';
                    } else if (isSelected && !isCorrect) {
                      optStyle.background = 'rgba(244, 63, 94, 0.15)';
                      optStyle.borderColor = '#f43f5e';
                      optStyle.color = '#fb7185';
                    } else {
                      optStyle.opacity = 0.5;
                    }
                  } else {
                    optStyle[':hover'] = {
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderColor: '#38bdf8'
                    };
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isAnswered}
                      style={optStyle}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        border: `1.5px solid ${isAnswered ? (isCorrect ? '#10b981' : isSelected ? '#f43f5e' : '#64748b') : '#64748b'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isAnswered && isCorrect ? '#10b981' : isAnswered && isSelected ? '#f43f5e' : 'transparent',
                        color: isAnswered && (isCorrect || isSelected) ? '#ffffff' : '#94a3b8'
                      }}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span style={{ flex: 1 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Real-time Technical Explanation */}
              {isAnswered && (
                <div style={{
                  background: selectedChoice === currentQ.correctIndex 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(244, 63, 94, 0.1)',
                  borderLeft: `4px solid ${selectedChoice === currentQ.correctIndex ? '#10b981' : '#f43f5e'}`,
                  padding: '14px 16px',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '0.85rem', 
                    color: selectedChoice === currentQ.correctIndex ? '#34d399' : '#fb7185',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {selectedChoice === currentQ.correctIndex ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{selectedChoice === currentQ.correctIndex ? 'Correct Analysis!' : 'Examiner Correction:'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {isAnswered && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)'
                    }}
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Viva Exam'}</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                margin: '0 auto 18px',
                background: evalResult.status === 'PASSED'
                  ? 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 70%)'
                  : 'radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(244, 63, 94, 0.05) 70%)',
                border: `2px solid ${evalResult.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                boxShadow: `0 0 30px ${evalResult.color}40`
              }}>
                {evalResult.icon}
              </div>

              <div style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '20px',
                background: `${evalResult.color}20`,
                border: `1px solid ${evalResult.color}60`,
                color: evalResult.color,
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '10px'
              }}>
                {evalResult.badge}
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                Viva Score: {scorePercent}%
              </h2>

              <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                {evalResult.summary}
              </p>

              {/* Metrics Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Questions</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{questions.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Correct</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{correctCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Mastery Status</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: evalResult.color, marginTop: '2px' }}>
                    {evalResult.status === 'PASSED' ? 'PASSED ✓' : 'RETRY'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="btn btn-secondary"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Retake Viva Exam</span>
                </button>

                {evalResult.status === 'PASSED' && (
                  <button
                    type="button"
                    onClick={handleSaveVivaResult}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>{saving ? 'Sealing Credential...' : '🎖️ Seal Certificate with Gold Viva Mastery'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
