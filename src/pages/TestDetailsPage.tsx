import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Test, StudentInfo, ExamResult } from '../types';
import { subscribeToTests, checkExistingAttempt } from '../firebase/services';
import { computeTestStatus, formatDateTime, getTimeDifferenceText } from '../utils/testHelpers';
import { 
  Clock, 
  HelpCircle, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  ArrowLeft,
  ShieldCheck,
  X,
  FileCheck,
  Award as AwardIcon,
  Calendar,
  Eye,
  BookOpen
} from 'lucide-react';
import { getDifficultyColor } from '../utils/helpers';

export const TestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingResult, setExistingResult] = useState<ExamResult | null>(null);

  // Modal State before start
  const [showStartModal, setShowStartModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: localStorage.getItem('lastStudentName') || '',
    mobile: localStorage.getItem('lastStudentMobile') || '',
    email: localStorage.getItem('lastStudentEmail') || '',
    language: 'English',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingAttempt, setCheckingAttempt] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToTests((allTests) => {
      const found = allTests.find(t => t.id === id);
      setTest(found || null);
      setLoading(false);
    }, false);

    // Check if device/student already attempted this test
    checkExistingAttempt(id, studentInfo.name, studentInfo.mobile, studentInfo.email)
      .then(res => {
        if (res) setExistingResult(res);
      })
      .catch(() => {});

    return () => unsub();
  }, [id]);

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test) return;

    if (!studentInfo.name.trim()) {
      setErrorMsg('Candidate Name is required to start the test.');
      return;
    }

    setCheckingAttempt(true);
    setErrorMsg('');

    try {
      // Save to localStorage for convenience
      localStorage.setItem('lastStudentName', studentInfo.name.trim());
      if (studentInfo.mobile) localStorage.setItem('lastStudentMobile', studentInfo.mobile.trim());
      if (studentInfo.email) localStorage.setItem('lastStudentEmail', studentInfo.email.trim());

      // Store active candidate info in sessionStorage
      sessionStorage.setItem(`exam_student_${test.id}`, JSON.stringify(studentInfo));

      // Navigate to Exam Page
      navigate(`/exam/${test.id}`);
    } catch (err) {
      console.error('Error starting exam:', err);
      sessionStorage.setItem(`exam_student_${test.id}`, JSON.stringify(studentInfo));
      navigate(`/exam/${test.id}`);
    } finally {
      setCheckingAttempt(false);
    }
  };

  const handleViewExistingResult = () => {
    if (existingResult) {
      sessionStorage.setItem('last_exam_result', JSON.stringify(existingResult));
      navigate('/result');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Test Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">The requested examination paper may have been removed or published in draft mode.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tests</span>
        </button>

        {/* Large Banner Image & Overview Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden mb-8">
          
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={test.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'}
              alt={test.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block px-3 py-1 bg-blue-600 font-bold text-xs rounded-lg uppercase tracking-wider mb-2">
                {test.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                {test.title}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {test.description}
            </p>

            {/* Test Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center mb-8">
              <div>
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 font-medium uppercase">Questions</span>
                <p className="text-base font-black text-slate-800 dark:text-slate-100">{test.totalQuestions} Qs</p>
              </div>

              <div>
                <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 font-medium uppercase">Duration</span>
                <p className="text-base font-black text-slate-800 dark:text-slate-100">{test.durationMins} Mins</p>
              </div>

              <div>
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 font-medium uppercase">Total Marks</span>
                <p className="text-base font-black text-slate-800 dark:text-slate-100">{test.totalMarks} Marks</p>
              </div>

              <div>
                <AlertCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 font-medium uppercase">Negative Mark</span>
                <p className="text-base font-black text-slate-800 dark:text-slate-100">
                  {test.negativeMarking > 0 ? `-${test.negativeMarking}` : 'None'}
                </p>
              </div>
            </div>

            {/* Schedule Status Notice Banner */}
            {(() => {
              const status = computeTestStatus(test);
              if (status === 'upcoming') {
                return (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-200">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block font-bold text-amber-900 dark:text-amber-100 mb-0.5">
                        ⏰ Test Paper Scheduled for Future Live Session
                      </strong>
                      This mock exam paper will automatically go <strong>LIVE</strong> on{' '}
                      <span className="underline font-bold">{formatDateTime(test.startTime)}</span> (in {getTimeDifferenceText(test.startTime)}). Candidate registration and test submission will open at that exact set time.
                    </div>
                  </div>
                );
              }
              if (status === 'expired') {
                return (
                  <div className="mb-6 p-4 bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                        ⌛ Test Paper Has Expired (समय समाप्त / Expired Paper)
                      </strong>
                      The active testing period for this exam paper ended on{' '}
                      <span className="font-bold">{formatDateTime(test.endTime)}</span>. New answer sheet submissions are disabled. You can view all questions, options, and answer explanations in Read-Only Solutions mode.
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Instructions Section */}
            <div className="mb-8">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Examination Instructions</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {test.instructions?.map((inst, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                )) || (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Ensure stable internet connectivity throughout the examination session.</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Dynamic Action Button based on Status */}
            {(() => {
              const status = computeTestStatus(test);
              if (status === 'upcoming') {
                return (
                  <button
                    disabled
                    className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-base rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-3 cursor-not-allowed opacity-90"
                  >
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>Scheduled — Opens at {formatDateTime(test.startTime)}</span>
                  </button>
                );
              }
              if (status === 'expired') {
                return (
                  <button
                    onClick={() => navigate(`/exam/${test.id}?mode=solution`)}
                    className="w-full py-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.01]"
                  >
                    <BookOpen className="w-6 h-6 text-amber-400" />
                    <span>View Question Paper & Solutions (प्रश्न पत्र एवं उत्तर देखें)</span>
                  </button>
                );
              }
              return (
                <button
                  onClick={() => setShowStartModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.01]"
                >
                  <Play className="w-6 h-6 fill-white" />
                  <span>Start Examination Now</span>
                </button>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Candidate Registration Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            
            <button
              onClick={() => setShowStartModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Candidate Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter details to generate your score card on the leaderboard. No password or registration needed.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleStartExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aniket Sharma"
                    value={studentInfo.name}
                    onChange={e => {
                      setStudentInfo({ ...studentInfo, name: e.target.value });
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={studentInfo.mobile}
                      onChange={e => setStudentInfo({ ...studentInfo, mobile: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="candidate@gmail.com"
                      value={studentInfo.email}
                      onChange={e => setStudentInfo({ ...studentInfo, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Medium / Language
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <select
                    value={studentInfo.language}
                    onChange={e => setStudentInfo({ ...studentInfo, language: e.target.value as any })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Bilingual">Bilingual (English + Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={checkingAttempt}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {checkingAttempt ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Begin Test Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
