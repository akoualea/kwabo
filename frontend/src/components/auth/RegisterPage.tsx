import React, { useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Globe, MailCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CURRENCIES, setUserCurrency, WORLD_COUNTRIES } from '../../data/worldCountries';
import { AuthPageLayout } from './AuthPageLayout';

export const RegisterPage: React.FC = () => {
  const { navigate, addToast, registerAccount, verifyEmail, resendVerificationEmail } = useApp();
  const [step, setStep] = useState<'form' | 'verify'>('form');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryName, setCountryName] = useState('France');
  const [dialCode, setDialCode] = useState('+33');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsVersion, setTermsVersion] = useState('1.2');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    api<{ data?: { version?: string } }>('/legal/terms', { skipAuthRedirect: true })
      .then((res) => {
        if (res?.data?.version) setTermsVersion(String(res.data.version));
      })
      .catch(() => {});
  }, []);

  const selectedCountry =
    WORLD_COUNTRIES.find((c) => c.name === countryName) || WORLD_COUNTRIES[0];
  const selectedCurrency = CURRENCIES[selectedCountry.currency] || CURRENCIES.EUR;

  const handleCountryChange = (nextCountryName: string) => {
    setCountryName(nextCountryName);
    const found = WORLD_COUNTRIES.find((c) => c.name === nextCountryName);
    if (found) {
      setDialCode(found.dial);
      setUserCurrency(found.currency);
    }
  };

  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    setUserCurrency(selectedCountry.currency);

    const res = await registerAccount({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: `${dialCode} ${phone.trim()}`.trim(),
      dial: dialCode,
      country: selectedCountry.code || selectedCountry.name,
      password,
      sponsor_code: referralCode.trim() || undefined,
      terms_accepted: termsAccepted,
      terms_version: termsVersion,
      preferred_currency: selectedCountry.currency,
    });

    setIsLoading(false);

    if (res.success) {
      addToast(`Un code de confirmation à 6 chiffres vient d'être envoyé à ${email.trim()}.`, 'info');
      setStep('verify');
      return;
    }

    if (res.errors) {
      setFieldErrors(res.errors);
    }
    setError(res.message || 'Veuillez vérifier les informations saisies.');
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    const res = await verifyEmail(email, verificationCode);
    setIsLoading(false);

    if (!res.success) {
      if (res.errors) setFieldErrors(res.errors);
      setError(res.message || 'Code de vérification invalide.');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    const res = await resendVerificationEmail(email);
    setIsResending(false);
    if (res.success) {
      addToast(res.message || 'Code renvoyé par e-mail.', 'info');
    } else {
      setError(res.message || 'Impossible de renvoyer le code.');
    }
  };

  const inputClassName =
    'min-h-[42px] w-full rounded-xl border border-[#d0e3f5] bg-white px-3.5 py-2 text-sm text-[#0d1d2b] outline-none transition focus:border-[#006191] focus:ring-2 focus:ring-[#1593d6]/20';
  const labelClassName = 'mb-1.5 block text-sm font-semibold text-[#0d1d2b]';

  if (step === 'verify') {
    return (
      <AuthPageLayout>
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3efff] text-[#006191]">
          <MailCheck className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0d1d2b] sm:text-[34px]">
          Confirmez votre e-mail
        </h2>
        <p className="mt-1 text-sm text-[#4c657a]">
          Nous avons envoyé un code à 6 chiffres à <strong>{email}</strong>. Saisissez-le ci-dessous pour activer votre espace client.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6] p-3 text-sm text-[#93000a]">
            {error}
          </p>
        )}

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label htmlFor="verify-code" className={labelClassName}>
              Code à 6 chiffres
            </label>
            <input
              id="verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              autoFocus
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              placeholder="123456"
              className={`${inputClassName} text-center text-lg font-semibold tracking-[0.35em]`}
            />
            {fieldErrors.code?.[0] && (
              <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.code[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[50px] w-full rounded-full bg-[#f7c531] px-5 font-bold text-[#10202e] shadow-md transition hover:bg-[#e0a410] disabled:opacity-60"
          >
            {isLoading ? 'Validation...' : 'Valider mon compte'}
          </button>

          <div className="flex items-center justify-between pt-2 text-sm">
            <button
              type="button"
              disabled={isResending}
              onClick={handleResend}
              className="font-semibold text-[#006191] underline underline-offset-2 hover:text-[#084d82] disabled:opacity-50"
            >
              {isResending ? 'Envoi en cours...' : 'Renvoyer le code'}
            </button>
            <button
              type="button"
              onClick={() => navigate('login')}
              className="text-[#4c657a] hover:text-[#0d1d2b]"
            >
              Aller à la connexion
            </button>
          </div>
        </form>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#edf4ff] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#006191]">
          Étape 1/2 : Identité
        </span>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#0d1d2b] sm:text-[32px]">
          Création de compte sécurisé
        </h2>
        <p className="mt-1.5 text-sm text-[#4c657a]">
          Gratuit, sans engagement : accédez à vos devis personnalisés et à votre coffre-fort numérique.
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6] p-3 text-sm text-[#93000a]">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="register-first-name" className={labelClassName}>Prénom</label>
            <input
              id="register-first-name"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={event => setFirstName(event.target.value)}
              placeholder="Ex. Rodrigue"
              className={inputClassName}
            />
            {fieldErrors.first_name?.[0] && (
              <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.first_name[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="register-last-name" className={labelClassName}>Nom</label>
            <input
              id="register-last-name"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={event => setLastName(event.target.value)}
              placeholder="Ex. Dossou-Yovo"
              className={inputClassName}
            />
            {fieldErrors.last_name?.[0] && (
              <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.last_name[0]}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className={labelClassName}>Adresse e-mail</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="vous@exemple.com"
            className={inputClassName}
          />
          {fieldErrors.email?.[0] && (
            <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <label htmlFor="register-country" className="block text-sm font-semibold text-[#0d1d2b]">
              Pays de résidence
            </label>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#edf4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#006191]">
              <Globe className="h-3 w-3 shrink-0" aria-hidden="true" />
              Devise : {selectedCurrency.code} ({selectedCurrency.symbol})
            </span>
          </div>
          <select
            id="register-country"
            value={countryName}
            onChange={(e) => handleCountryChange(e.target.value)}
            className={`${inputClassName} max-w-full`}
          >
            {WORLD_COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name} ({c.dial} · {c.currency})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
          <div>
            <label htmlFor="register-dial-code" className={labelClassName}>Indicatif</label>
            <input
              id="register-dial-code"
              type="text"
              value={dialCode}
              onChange={(event) => setDialCode(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="register-phone" className={labelClassName}>Téléphone</label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel-national"
              required
              value={phone}
              onChange={event => setPhone(event.target.value)}
              placeholder="6 12 34 56 78"
              className={inputClassName}
            />
            {fieldErrors.phone?.[0] && (
              <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.phone[0]}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="register-password" className={labelClassName}>Mot de passe sécurisé</label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              pattern="(?=.*[A-Z])(?=.*[0-9]).{8,}"
              title="Au moins 8 caractères, avec 1 majuscule et 1 chiffre."
              value={password}
              onChange={event => setPassword(event.target.value)}
              style={{ paddingRight: '3rem' }}
              className={`${inputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(visible => !visible)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute inset-y-0 right-3 flex items-center text-[#4c657a] hover:text-[#006191]"
            >
              {showPassword ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-[#4c657a]">Au moins 8 caractères, avec 1 majuscule et 1 chiffre.</p>
          {fieldErrors.password?.[0] && (
            <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.password[0]}</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#d0e3f5] bg-[#f7f9ff] p-3.5">
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="register-referral" className="text-xs font-bold text-[#0d1d2b]">
              Code de parrainage <span className="font-normal text-[#4c657a]">(facultatif)</span>
            </label>
            <span className="text-[11px] font-bold text-[#765b00]">Bonus 15 €</span>
          </div>
          <input
            id="register-referral"
            type="text"
            value={referralCode}
            onChange={event => setReferralCode(event.target.value)}
            placeholder="Code reçu d'un proche (ex: KW-...)"
            className={inputClassName}
          />
          {fieldErrors.sponsor_code?.[0] && (
            <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.sponsor_code[0]}</p>
          )}
        </div>

        <label className="flex items-start gap-2.5 text-xs leading-5 text-[#3f4850] sm:text-sm">
          <input
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#006191]"
          />
          <span>
            J'accepte les{' '}
            <button
              type="button"
              onClick={() => navigate('cgu')}
              className="font-semibold text-[#006191] underline underline-offset-2 hover:text-[#084d82]"
            >
              Conditions Générales d'Utilisation
            </button>{' '}
            et la{' '}
            <button
              type="button"
              onClick={() => navigate('privacy')}
              className="font-semibold text-[#006191] underline underline-offset-2 hover:text-[#084d82]"
            >
              politique de confidentialité
            </button>.
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#f7c531] px-5 text-sm font-bold text-[#10202e] shadow-md transition hover:bg-[#e0a410] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006191]"
        >
          <span>{isLoading ? 'Création en cours...' : 'Créer mon compte & accéder aux services'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#3f4850]">
        Déjà membre BeniLink ?{' '}
        <button type="button" onClick={() => navigate('login')} className="font-bold text-[#006191] underline underline-offset-2">
          Se connecter à l'espace client
        </button>
      </p>
    </AuthPageLayout>
  );
};
