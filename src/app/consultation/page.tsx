"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type SurgeonItem = {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  procedures: string;
  specialties: string[];
  price: string;
  image: string;
};

export default function ConsultationPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;
  const [selectedFormType, setSelectedFormType] = useState<'basic' | 'detailed' | null>(null);
  const [selectedSurgeons, setSelectedSurgeons] = useState<number[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample surgeon data (could be replaced with real data later)
  const surgeons: SurgeonItem[] = useMemo(() => ([
    { id: 1, name: 'Dr. Sarah Mitchell', location: 'Beverly Hills, CA', rating: 4.9, reviews: 324, procedures: '500+', specialties: ['FUE', 'FUT', 'Robotic'], price: '$8,000 - $15,000', image: 'SM' },
    { id: 2, name: 'Dr. Michael Rodriguez', location: 'Miami, FL', rating: 4.8, reviews: 287, procedures: '400+', specialties: ['FUE', 'PRP'], price: '$6,000 - $12,000', image: 'MR' },
    { id: 3, name: 'Dr. James Liu', location: 'New York, NY', rating: 4.9, reviews: 412, procedures: '600+', specialties: ['FUE', 'FUT', 'Robotic'], price: '$10,000 - $18,000', image: 'JL' },
    { id: 4, name: 'Dr. Emily Chen', location: 'Los Angeles, CA', rating: 4.7, reviews: 198, procedures: '300+', specialties: ['FUE', 'Female Hair Loss'], price: '$7,000 - $14,000', image: 'EC' },
    { id: 5, name: 'Dr. Robert Johnson', location: 'Chicago, IL', rating: 4.8, reviews: 356, procedures: '450+', specialties: ['FUT', 'Repair'], price: '$5,000 - $11,000', image: 'RJ' },
  ]), []);

  useEffect(() => {
    // Load saved progress
    const saved = typeof window !== 'undefined' ? localStorage.getItem('follicleflow_consultation') : null;
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (confirm('We found your saved progress. Continue where you left off?')) {
          setCurrentStep(data.currentStep || 1);
          setSelectedFormType(data.selectedFormType || null);
          setSelectedSurgeons(data.selectedSurgeons || []);
        }
      } catch {}
    }
  }, []);

  function saveProgress() {
    const formData = collectFormData();
    localStorage.setItem('follicleflow_consultation', JSON.stringify({
      ...formData,
      currentStep,
      selectedFormType,
      savedAt: new Date().toISOString(),
    }));
    alert('✅ Progress saved! You can continue later using the same browser.');
  }

  function collectFormData() {
    const data: Record<string, any> = {};
    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value || '';
    const getCheckedVals = (name: string) => Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)).map(el => el.value);
    const getChecked = (name: string) => (document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value || '');

    data.firstName = getVal('firstName');
    data.lastName = getVal('lastName');
    data.email = getVal('email');
    data.phone = getVal('phone');
    data.age = getVal('age');
    data.gender = getVal('gender');
    data.location = getVal('location');
    data.hairLossTypes = getCheckedVals('hairLossType');
    data.hairLossDuration = getChecked('hairLossDuration');
    data.previousTreatments = getCheckedVals('previousTreatments');
    data.additionalInfo = getVal('additionalInfo');
    data.budget = getChecked('budget');
    data.timeline = getChecked('timeline');
    data.procedureType = getChecked('procedureType');
    data.selectedSurgeons = selectedSurgeons;
    data.uploadedPhotosCount = uploadedPhotos.length;
    return data;
  }

  function nextStep() {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1));
    }
  }

  function prevStep() {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }

  function validateCurrentStep(): boolean {
    if (currentStep === 1) {
      const required = ['firstName','lastName','email','phone','age','gender','location'];
      return required.every(id => (document.getElementById(id) as HTMLInputElement | null)?.value.trim());
    }
    if (currentStep === 2) {
      const hairLossType = document.querySelector('input[name="hairLossType"]:checked');
      const duration = document.querySelector('input[name="hairLossDuration"]:checked');
      return Boolean(hairLossType && duration);
    }
    if (currentStep === 3) {
      const budget = document.querySelector('input[name="budget"]:checked');
      const timeline = document.querySelector('input[name="timeline"]:checked');
      const minPhotos = selectedFormType === 'detailed' ? 5 : 3;
      if (!budget || !timeline) return false;
      const photoValidation = document.getElementById('photo-validation');
      if (uploadedPhotos.length < minPhotos) {
        photoValidation?.classList.remove('hidden');
        return false;
      }
      photoValidation?.classList.add('hidden');
      return true;
    }
    if (currentStep === 4) {
      return selectedSurgeons.length > 0;
    }
    return true;
  }

  function toggleSurgeonSelection(id: number) {
    setSelectedSurgeons(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) {
        alert('You can select up to 5 surgeons maximum.');
        return prev;
      }
      return [...prev, id];
    });
  }

  function handleFiles(files: File[]) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const underLimit = imageFiles.filter(f => f.size <= 10 * 1024 * 1024);
    setUploadedPhotos(prev => [...prev, ...underLimit]);
  }

  function removePhoto(index: number) {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  }

  function submitForm() {
    if (!validateCurrentStep()) {
      alert('Please complete all required fields before submitting.');
      return;
    }
    const data = collectFormData();
    alert(`🎉 Consultation request submitted successfully!\n\nYour request has been sent to ${selectedSurgeons.length} surgeon(s). You'll receive responses within 24-48 hours.`);
    localStorage.removeItem('follicleflow_consultation');
  }

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">FollicleFlow</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <Link href="/" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium">
                <span>←</span>
                <span>Back to Dashboard</span>
              </Link>
              <span className="hidden sm:inline">|</span>
              <span className="font-semibold">Need help?</span>
              <Link href="/support" className="text-purple-600 hover:text-purple-700">Contact Support</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {[1,2,3,4].map(step => (
                <div key={step} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step < currentStep ? 'bg-emerald-500 text-white' : step === currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step}</div>
                  {step < 4 && (
                    <div className="w-16 h-1 bg-gray-200">
                      <div className="h-full bg-purple-600 transition-all" style={{ width: step < currentStep ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600"><span>Step {currentStep}</span> of 4</div>
          </div>
          <div className="h-1.5 bg-gray-200 rounded">
            <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Form Type Selection */}
      {!selectedFormType && (
        <div id="form-type-selection" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Consultation Form</h1>
            <p className="text-xl text-gray-600">Select the form that best fits your needs</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 bg-white rounded-2xl shadow transition-all cursor-pointer hover:shadow-xl" onClick={() => setSelectedFormType('basic')}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Form</h2>
                <p className="text-gray-600 mb-4">Get started fast with essential information</p>
              </div>
              <ul className="space-y-3 mb-6 text-gray-700">
                <li className="flex items-center space-x-3"><span className="text-green-600">✓</span><span>Basic personal information</span></li>
                <li className="flex items-center space-x-3"><span className="text-green-600">✓</span><span>Hair loss type & timeline</span></li>
                <li className="flex items-center space-x-3"><span className="text-green-600">✓</span><span>Budget & procedure timeline</span></li>
                <li className="flex items-center space-x-3"><span className="text-green-600">✓</span><span>Surgeon selection</span></li>
              </ul>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">~5 minutes</div>
                <div className="text-sm text-gray-600">Quick consultation request</div>
              </div>
              <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700" onClick={() => setSelectedFormType('basic')}>Start Quick Form</button>
            </div>
            <div className="relative p-8 bg-white rounded-2xl shadow transition-all cursor-pointer hover:shadow-xl border-2 border-purple-200" onClick={() => setSelectedFormType('detailed')}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Recommended</span></div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Comprehensive Form</h2>
                <p className="text-gray-600 mb-4">Complete medical assessment for best results</p>
              </div>
              <ul className="space-y-3 mb-6 text-gray-700">
                <li className="flex items-center space-x-3"><span className="text-purple-600">✓</span><span>Complete medical history</span></li>
                <li className="flex items-center space-x-3"><span className="text-purple-600">✓</span><span>Detailed hair loss analysis</span></li>
                <li className="flex items-center space-x-3"><span className="text-purple-600">✓</span><span>Lifestyle & health factors</span></li>
                <li className="flex items-center space-x-3"><span className="text-purple-600">✓</span><span>Required photo guidelines</span></li>
                <li className="flex items-center space-x-3"><span className="text-purple-600">✓</span><span>Goals & expectations assessment</span></li>
              </ul>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">~15 minutes</div>
                <div className="text-sm text-gray-600">Comprehensive assessment</div>
              </div>
              <button className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700" onClick={() => setSelectedFormType('detailed')}>Start Comprehensive Form</button>
            </div>
          </div>
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-6 py-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-blue-800 font-semibold">Both forms can be saved and completed later</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      {selectedFormType && (
        <main id="main-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="p-8 bg-white rounded-2xl shadow mb-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Get Started</h1>
                <p className="text-gray-600">Tell us about yourself so we can match you with the right surgeons</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input id="firstName" className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input id="lastName" className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input id="email" type="email" className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input id="phone" type="tel" className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input id="age" type="number" min={18} max={80} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select id="gender" className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">City, State</label>
                  <input id="location" className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="p-8 bg-white rounded-2xl shadow mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">About Your Hair Loss</h2>
                <p className="text-gray-600">Help us understand your specific situation and goals</p>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What type of hair loss are you experiencing?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    ['male-pattern','Male Pattern Baldness'],['female-pattern','Female Pattern Hair Loss'],['alopecia','Alopecia Areata'],['thinning','General Thinning'],['receding','Receding Hairline'],['crown','Crown Thinning']
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" name="hairLossType" value={val} className="w-5 h-5 border-2 rounded" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How long have you been experiencing hair loss?</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    ['less-than-1-year','Less than 1 year'],['1-3-years','1-3 years'],['3-5-years','3-5 years'],['more-than-5-years','More than 5 years']
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="hairLossDuration" value={val} className="w-5 h-5 border-2 rounded-full" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {selectedFormType === 'detailed' && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History & Health</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['Diabetes','High Blood Pressure','Heart Disease','Thyroid Disorders','Autoimmune Disorders','Bleeding Disorders'].map((label, idx) => (
                      <label key={idx} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" name="medicalConditions" value={label.toLowerCase().replace(/\s+/g,'-')} className="w-5 h-5 border-2 rounded" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Current Medications & Supplements</h4>
                    <textarea id="medications" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} placeholder="List medications, vitamins, supplements..." />
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Allergies</h4>
                    <textarea id="allergies" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" rows={2} placeholder="List any known allergies..." />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Smoking/Nicotine Use</h4>
                      {['Never smoked','Former smoker','Current smoker','Vaping/E-cigarettes'].map((label, i) => (
                        <label key={i} className="flex items-center space-x-3">
                          <input type="radio" name="smoking" value={label.toLowerCase().split(' ')[0]} className="w-5 h-5 border-2 rounded-full" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Alcohol Consumption</h4>
                      {['None','Occasional (1-2 drinks/week)','Moderate (3-7 drinks/week)','Heavy (8+ drinks/week)'].map((label, i) => (
                        <label key={i} className="flex items-center space-x-3">
                          <input type="radio" name="alcohol" value={label.split(' ')[0].toLowerCase()} className="w-5 h-5 border-2 rounded-full" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label htmlFor="hairLossAge" className="block text-sm font-medium text-gray-700 mb-1">Age when hair loss started</label>
                      <input id="hairLossAge" type="number" min={10} max={80} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Rate of progression</h4>
                      {['Slow','Moderate','Rapid'].map((label, i) => (
                        <label key={i} className="flex items-center space-x-3">
                          <input type="radio" name="progression" value={label.toLowerCase()} className="w-5 h-5 border-2 rounded-full" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Family History of Hair Loss</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {['Father\'s side','Mother\'s side','Both sides','No family history'].map((label, i) => (
                        <label key={i} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" name="familyHistory" value={label.toLowerCase().replace(/\s+/g,'-')} className="w-5 h-5 border-2 rounded" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Goals & Expectations</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {['Lower/restore hairline','Fill in crown area','Increase overall density','Temple restoration','Repair previous transplant','Cover scars'].map((label, i) => (
                        <label key={i} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" name="goals" value={label.toLowerCase().replace(/\s+/g,'-')} className="w-5 h-5 border-2 rounded" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4">
                      <textarea id="additionalInfo" rows={4} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Any other medical history, concerns, or questions..." />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="p-8 bg-white rounded-2xl shadow mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Budget & Timeline</h2>
                <p className="text-gray-600">Help us match you with surgeons that fit your budget and schedule</p>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's your budget range for the procedure?</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    ['under-5000','Under $5,000','Budget-friendly options'],['5000-10000','$5,000 - $10,000','Most popular range'],['10000-15000','$10,000 - $15,000','Premium procedures'],
                    ['15000-20000','$15,000 - $20,000','High-end treatments'],['over-20000','Over $20,000','Luxury procedures'],['not-sure','Not Sure','Need guidance']
                  ].map(([val, title, desc]) => (
                    <label key={val} className="flex items-center space-x-3 p-6 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <input type="radio" name="budget" value={val} className="w-5 h-5 border-2 rounded-full" />
                      <div>
                        <div className="font-semibold">{title}</div>
                        <div className="text-sm text-gray-600">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">When are you looking to have the procedure?</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    ['asap','ASAP'],['1-3-months','1-3 months'],['3-6-months','3-6 months'],['6-12-months','6-12 months'],['over-1-year','Over 1 year'],['just-researching','Just researching']
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="timeline" value={val} className="w-5 h-5 border-2 rounded-full" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred procedure type (if you know)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    ['fue','FUE (Follicular Unit Extraction)','Individual follicle extraction'],
                    ['fut','FUT (Follicular Unit Transplantation)','Strip method'],
                    ['robotic','Robotic Hair Transplant','ARTAS or similar systems'],
                    ['not-sure','Not Sure','Need surgeon\'s recommendation']
                  ].map(([val, title, desc]) => (
                    <label key={val} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="procedureType" value={val} className="w-5 h-5 border-2 rounded-full" />
                      <div>
                        <div className="font-semibold">{title}</div>
                        <div className="text-sm text-gray-600">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos (Required for Accurate Assessment)</h3>
                <p className="text-gray-600 mb-6">Clear photos from multiple angles help surgeons provide accurate consultations and quotes.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">📸 Photo Guidelines</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <div className="font-semibold">Lighting & Setup</div>
                      <ul className="list-disc pl-5">
                        <li>Bright, natural daylight</li>
                        <li>Plain, light background</li>
                        <li>Clean, dry hair</li>
                        <li>Clear, focused images</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold">Required Views</div>
                      <ul className="list-disc pl-5">
                        <li>Front</li>
                        <li>Top-down</li>
                        <li>Left & right profiles</li>
                        <li>Back (donor)</li>
                        <li>Close-up thinning</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    ['Frontal View','Required'],['Top-Down View','Required'],['Right Profile','Required'],['Left Profile','Required'],['Back View','Required'],['Close-up','Recommended']
                  ].map(([title, tag], i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-700">{i+1}. {title}</h5>
                        <span className={`text-xs px-2 py-1 rounded ${tag==='Required' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{tag}</span>
                      </div>
                      <p className="text-sm text-gray-600">{title === 'Frontal View' ? 'Face camera directly' : title === 'Top-Down View' ? 'Camera above head' : 'See guidelines above'}</p>
                    </div>
                  ))}
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Drop photos here or click to upload</p>
                  <p className="text-gray-500">Upload all required views for accurate assessment</p>
                  <p className="text-sm text-gray-400 mt-2">PNG, JPG up to 10MB each</p>
                  <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFiles(Array.from(e.target.files || []))} />
                </div>
                <div id="uploaded-photos" className={`grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 ${uploadedPhotos.length === 0 ? 'hidden' : ''}`}>
                  {uploadedPhotos.map((file, idx) => (
                    <div key={idx} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={`upload-${idx}`} className="w-full h-24 object-cover rounded-lg" src={URL.createObjectURL(file)} />
                      <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600" onClick={() => removePhoto(idx)}>×</button>
                    </div>
                  ))}
                </div>
                <div id="photo-validation" className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hidden">
                  <div className="flex items-center space-x-2 mb-2"><span className="text-yellow-600">⚠</span><h5 className="font-semibold text-yellow-800">Photo Requirements</h5></div>
                  <p className="text-yellow-700 text-sm">Please upload sufficient photos for accurate assessment.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="p-8 bg-white rounded-2xl shadow mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Surgeons</h2>
                <p className="text-gray-600">Select up to 5 surgeons you'd like to consult with</p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recommended Surgeons in Your Area</h3>
                <span className="text-sm text-gray-600"><span id="selected-count">{selectedSurgeons.length}</span> of 5 selected</span>
              </div>
              <div className="space-y-4">
                {surgeons.map(s => (
                  <div key={s.id} className={`border-2 rounded-xl p-4 transition ${selectedSurgeons.includes(s.id) ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-purple-600">{s.image}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{s.name}</h4>
                            <p className="text-gray-600">{s.location}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-400">★</span>
                                <span className="font-semibold">{s.rating}</span>
                                <span className="text-gray-600">({s.reviews} reviews)</span>
                              </div>
                              <span className="text-gray-600">{s.procedures} procedures</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{s.price}</div>
                            <div className="text-sm text-gray-600">Estimated range</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="text-sm text-gray-600 mb-2">Specialties:</div>
                          <div className="flex flex-wrap gap-2">
                            {s.specialties.map((sp, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{sp}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <input type="checkbox" className="w-5 h-5 border-2 rounded" checked={selectedSurgeons.includes(s.id)} onChange={() => toggleSurgeonSelection(s.id)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                <p className="text-blue-800">Selecting multiple surgeons increases your chances of finding the perfect match. Each surgeon will provide their own consultation and quote.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button className={`px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 ${currentStep === 1 ? 'invisible' : ''}`} onClick={prevStep}>← Previous</button>
            <div className="flex-1" />
            {currentStep < totalSteps && (
              <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700" onClick={nextStep}>Next Step →</button>
            )}
            {currentStep === totalSteps && (
              <button className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700" onClick={submitForm}>Submit Consultation Request</button>
            )}
          </div>
          <div className="text-center mt-6">
            <button className="text-purple-600 hover:text-purple-700 font-semibold" onClick={saveProgress}>💾 Save Progress & Continue Later</button>
          </div>
        </main>
      )}
    </div>
  );
}


