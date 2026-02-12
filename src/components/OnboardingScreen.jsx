import React, { useState } from 'react';
import { 
  Shield, ChevronRight, ChevronLeft, User, Phone, 
  Heart, AlertTriangle, Check, Camera, MapPin,
  Bell, Users, Zap
} from 'lucide-react';

const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    emergencyInfo: '',
    gender: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});

  const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Slides d'introduction
  const introSlides = [
    {
      icon: Shield,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/20',
      title: 'Bienvenue sur SOS Africa',
      subtitle: 'Votre sécurité, notre priorité',
      description: 'L\'application qui vous protège et connecte avec vos proches en cas d\'urgence.',
      features: [
        { icon: '🆘', text: 'Alerte SOS en 1 tap' },
        { icon: '📍', text: 'Partage de position GPS' },
        { icon: '📱', text: 'Fonctionne hors ligne' }
      ]
    },
    {
      icon: Zap,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-500/20',
      title: 'Réagissez en un instant',
      subtitle: 'Plusieurs façons de lancer une alerte',
      description: 'Bouton SOS, secousse du téléphone, ou mot de code vocal.',
      features: [
        { icon: '👆', text: 'Bouton SOS géant' },
        { icon: '📳', text: 'Secouez 3 fois' },
        { icon: '🌙', text: 'Mode furtif (écran noir)' }
      ]
    },
    {
      icon: Users,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/20',
      title: 'Restez connecté',
      subtitle: 'Avec vos proches et la communauté',
      description: 'Vos contacts reçoivent votre position. Les utilisateurs proches peuvent vous aider.',
      features: [
        { icon: '👨‍👩‍👧', text: 'Alertez famille & amis' },
        { icon: '🌍', text: 'Réseau communautaire' },
        { icon: '🚶', text: 'Mode accompagnement trajet' }
      ]
    }
  ];

  const totalSteps = introSlides.length + 2; // Intro slides + profile + medical

  // Validation
  const validateStep = () => {
    const newErrors = {};
    
    if (step === introSlides.length) {
      // Validation profil
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Prénom requis';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Téléphone requis';
      }
    }
    
    if (step === introSlides.length + 1) {
      // Validation finale
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Vous devez accepter les conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const nextStep = () => {
    if (validateStep()) {
      if (step < totalSteps - 1) {
        setStep(step + 1);
      } else {
        // Compléter l'onboarding
        onComplete(formData);
      }
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Rendu des slides d'intro
  const renderIntroSlide = (slide, index) => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {/* Icône */}
      <div className={`w-24 h-24 ${slide.iconBg} rounded-full flex items-center justify-center mb-6`}>
        <slide.icon className={`w-12 h-12 ${slide.iconColor}`} />
      </div>

      {/* Titre */}
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        {slide.title}
      </h1>
      <p className="text-lg text-red-400 text-center mb-4">
        {slide.subtitle}
      </p>
      <p className="text-slate-400 text-center mb-8 max-w-sm">
        {slide.description}
      </p>

      {/* Features */}
      <div className="w-full max-w-sm space-y-3">
        {slide.features.map((feature, i) => (
          <div 
            key={i}
            className="flex items-center gap-4 bg-slate-800/50 rounded-xl p-4"
          >
            <span className="text-2xl">{feature.icon}</span>
            <span className="text-white">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Rendu du formulaire profil
  const renderProfileForm = () => (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Votre profil</h1>
        <p className="text-slate-400">Ces informations seront affichées dans vos alertes</p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        {/* Photo (optionnel) */}
        <div className="flex justify-center mb-6">
          <button className="relative">
            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center border-2 border-dashed border-slate-600">
              <Camera className="w-8 h-8 text-slate-500" />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500">
              Optionnel
            </span>
          </button>
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Votre prénom"
            className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white 
                       placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500
                       ${errors.firstName ? 'border-red-500' : 'border-slate-700'}`}
          />
          {errors.firstName && (
            <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Nom de famille</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Votre nom"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl 
                       text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+225 07 00 00 00 00"
              className={`w-full pl-11 pr-4 py-3 bg-slate-800 border rounded-xl text-white 
                         placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500
                         ${errors.phone ? 'border-red-500' : 'border-slate-700'}`}
            />
          </div>
          {errors.phone && (
            <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Genre</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'male', label: 'Homme', icon: '👨' },
              { value: 'female', label: 'Femme', icon: '👩' },
              { value: 'other', label: 'Autre', icon: '🧑' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, gender: option.value })}
                className={`p-3 rounded-xl text-center transition-all ${
                  formData.gender === option.value
                    ? 'bg-red-600 border-2 border-red-400'
                    : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'
                }`}
              >
                <span className="text-xl block mb-1">{option.icon}</span>
                <span className="text-white text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu du formulaire médical
  const renderMedicalForm = () => (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Informations médicales</h1>
        <p className="text-slate-400 text-sm">Optionnel mais peut sauver des vies</p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        {/* Groupe sanguin */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Groupe sanguin</label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, bloodType: type })}
                className={`p-3 rounded-xl font-bold transition-all ${
                  formData.bloodType === type
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Allergies connues
          </label>
          <input
            type="text"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            placeholder="Ex: Pénicilline, arachides..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl 
                       text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Conditions médicales */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Conditions médicales
          </label>
          <input
            type="text"
            value={formData.medicalConditions}
            onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
            placeholder="Ex: Diabète, asthme, épilepsie..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl 
                       text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Info supplémentaire */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Message personnalisé pour les urgences
          </label>
          <textarea
            value={formData.emergencyInfo}
            onChange={(e) => setFormData({ ...formData, emergencyInfo: e.target.value })}
            placeholder="Informations importantes que les secours doivent savoir..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl 
                       text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500
                       resize-none"
          />
        </div>

        {/* Accepter les conditions */}
        <div className="pt-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-red-500 
                         focus:ring-red-500 focus:ring-offset-0"
            />
            <span className="text-slate-400 text-sm">
              J'accepte les <a href="#" className="text-red-400 underline">conditions d'utilisation</a> et 
              la <a href="#" className="text-red-400 underline">politique de confidentialité</a>.
              Je comprends que mes données sont utilisées uniquement pour les alertes d'urgence.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-red-400 text-xs mt-2">{errors.acceptTerms}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Rendu principal
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col safe-area-inset">
      {/* Header avec progression */}
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          {step > 0 ? (
            <button onClick={prevStep} className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6 text-slate-400" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          
          <div className="flex items-center gap-1">
            <Shield className="w-6 h-6 text-red-500" />
            <span className="font-bold text-white">SOS Africa</span>
          </div>
          
          <button 
            onClick={() => onComplete(formData)}
            className="text-slate-500 text-sm"
          >
            Passer
          </button>
        </div>

        {/* Barre de progression */}
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      {/* Contenu */}
      {step < introSlides.length && renderIntroSlide(introSlides[step], step)}
      {step === introSlides.length && renderProfileForm()}
      {step === introSlides.length + 1 && renderMedicalForm()}

      {/* Footer avec bouton suivant */}
      <footer className="px-6 pb-8 pt-4">
        {/* Indicateurs de page pour les intros */}
        {step < introSlides.length && (
          <div className="flex justify-center gap-2 mb-6">
            {introSlides.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'w-8 bg-red-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={nextStep}
          className="w-full py-4 bg-red-600 text-white font-bold text-lg rounded-2xl
                     flex items-center justify-center gap-2
                     hover:bg-red-500 active:scale-[0.98] transition-all"
        >
          {step < totalSteps - 1 ? (
            <>
              Continuer
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Commencer à utiliser SOS Africa
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default OnboardingScreen;