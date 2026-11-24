import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthPageLayout } from './AuthPageLayout';

interface LoginPageProps {
  mode?: 'client' | 'admin' | 'operator';
}

export const LoginPage: React.FC<LoginPageProps> = ({ mode = 'client' }) => {
  const { currentUser, role, login, enterDevPreview, verifyEmail, resendVerificationEmail, navigate, addToast } = useApp();
  const isClient = mode === 'client';
  const isAdmin = mode === 'admin';
  const isOperator = mode === 'operator';
  const isTeam = isAdmin || isOperator;
  const expectedRole = isAdmin ? 'ADMIN' : isOperator ? 'OPERATOR' : 'USER';
  const hasOtherActiveSession = Boolean(currentUser && role !== 'VISITOR' && role !== expectedRole);
  const currentDashboardView =
    role === 'ADMIN' ? 'admin-dashboard' : role === 'OPERATOR' ? 'operator-dashboard' : 'client-dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);

  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setNeedsTwoFactor(false);
    setNeedsVerification(false);
    setTwoFactorCode('');
    setVerificationCode('');
    setError(null);
    setFieldErrors({});
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    const result = await login(email, password, {
      isTeam,
      expectedRole,
      code: needsTwoFactor ? twoFactorCode : undefined,
    });

    setIsLoading(false);

    if (result.success) return;

    if (result.needsCode) {
      setNeedsTwoFactor(true);
      setError(null);
      return;
    }

    if (result.needsVerification) {
      setNeedsVerification(true);
      setError(result.message || null);
      return;
    }

    if (result.errors) {
      setFieldErrors(result.errors);
    }
    setError(result.message || 'Identifiants invalides. Vérifiez votre adresse e-mail.');
  };

  const handleVerifyEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    const result = await verifyEmail(email, verificationCode);
    setIsLoading(false);

    if (!result.success) {
      if (result.errors) setFieldErrors(result.errors);
      setError(result.message || 'Code de vérification invalide.');
    }
  };

  const handleResendCode = async () => {
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
    'min-h-[48px] w-full rounded-xl border border-[#d0e3f5] bg-white px-3.5 py-2.5 text-sm text-[#0d1d2b] outline-none transition focus:border-[#006191] focus:ring-2 focus:ring-[#1593d6]/20';
  const labelClassName = 'mb-1.5 block text-sm font-semibold text-[#0d1d2b]';

  if (needsVerification) {
    return (
      <AuthPageLayout>
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3efff] text-[#006191]">
          <MailCheck className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0d1d2b] sm:text-[34px]">
          Vérifiez votre e-mail
        </h2>
        <p className="mt-1 text-sm text-[#4c657a]">
          Saisissez le code à 6 chiffres envoyé à <strong>{email}</strong> pour activer votre compte.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6] p-3 text-sm text-[#93000a]">
            {error}
          </p>
        )}

        <form onSubmit={handleVerifyEmail} className="mt-6 space-y-4">
          <div>
            <label htmlFor="verify-login-code" className={labelClassName}>
              Code de confirmation (6 chiffres)
            </label>
            <input
              id="verify-login-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
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
            {isLoading ? 'Vérification...' : 'Confirmer mon e-mail'}
          </button>

          <div className="flex items-center justify-between pt-1 text-sm">
            <button
              type="button"
              disabled={isResending}
              onClick={handleResendCode}
              className="font-semibold text-[#006191] underline underline-offset-2 hover:text-[#084d82] disabled:opacity-50"
            >
              {isResending ? 'Envoi...' : 'Renvoyer le code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setNeedsVerification(false);
                setError(null);
              }}
              className="text-[#4c657a] hover:text-[#0d1d2b]"
            >
              Retour
            </button>
          </div>
        </form>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <div className="text-center">
        {isTeam && (
          <div className="mb-1.5 inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#006191]">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            <span>{isAdmin ? 'Portail Direction' : 'Portail Opérateur Terrain'}</span>
          </div>
        )}

        <h2
          className={
            isTeam
              ? 'font-display text-2xl font-bold tracking-tight text-[#0d1d2b] sm:text-3xl'
              : 'font-display text-2xl font-bold tracking-tight text-[#0d1d2b] sm:text-[32px]'
          }
        >
          {isAdmin ? 'Console BeniLink' : isOperator ? 'Espace Agent BeniLink' : 'Connexion à votre espace'}
        </h2>
        <p className="mt-1.5 text-sm text-[#4c657a]">
          {isAdmin
            ? 'Connexion réservée aux administrateurs.'
            : isOperator
              ? 'Connectez-vous avec les identifiants transmis par votre administrateur.'
              : 'Saisissez vos identifiants pour accéder à vos dossiers BeniLink.'}
        </p>
      </div>

      {hasOtherActiveSession && currentUser && (
        <div className="mt-4 rounded-2xl border border-[#f2c02c] bg-[#ffdf93]/40 p-3.5 text-xs text-[#241a00]">
          <p className="font-bold">
            Session active : {currentUser.fullName || currentUser.email}
          </p>
          <p className="mt-0.5 text-[#594400]">
            Vous connecter ici remplacera la session en cours.
          </p>
          <button
            type="button"
            onClick={() => navigate(currentDashboardView)}
            className="mt-2 font-bold text-[#006191] underline underline-offset-2 hover:text-[#084d82]"
          >
            Retourner à mon espace actuel
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-5 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6] p-3 text-sm text-[#93000a]">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className={labelClassName}>Adresse e-mail</label>
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#6f7881]" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="vous@exemple.com"
              style={{ paddingLeft: '2.75rem' }}
              className={`${inputClassName} pl-11`}
            />
          </div>
          {fieldErrors.email?.[0] && (
            <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className={labelClassName}>
            Mot de passe
          </label>
          <div className="relative flex items-center">
            <KeyRound className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#6f7881]" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
              className={`${inputClassName} pl-11 pr-12`}
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
          {fieldErrors.password?.[0] && (
            <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.password[0]}</p>
          )}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('forgot-password')}
              className="text-xs font-semibold text-[#006191] transition hover:text-[#084d82] hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </div>

        {needsTwoFactor && (
          <div className="space-y-2 rounded-2xl border border-[#d0e3f5] bg-[#edf4ff] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#006191]">
              <ShieldCheck className="h-4 w-4" />
              <span>Double authentification activée</span>
            </div>
            <label htmlFor="login-2fa-code" className={labelClassName}>
              Code à 6 chiffres (application d'authentification)
            </label>
            <input
              id="login-2fa-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              required
              autoFocus
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value)}
              placeholder="123456"
              className={`${inputClassName} bg-white text-center text-base font-semibold tracking-[0.3em]`}
            />
            {fieldErrors.code?.[0] && (
              <p className="mt-1 text-xs text-[#ba1a1a]">{fieldErrors.code[0]}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1 text-xs sm:text-sm">
          <label className="flex items-center gap-2 font-medium text-[#0d1d2b]">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#006191]" />
            Mémoriser cet appareil
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#f7c531] px-5 text-sm font-bold text-[#10202e] shadow-md transition hover:bg-[#e0a410] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006191]"
        >
          <span>{isLoading ? 'Connexion en cours...' : needsTwoFactor ? 'Valider le code' : 'Se connecter à mon espace'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {isClient && (
        <p className="mt-5 text-center text-sm text-[#3f4850]">
          Nouveau sur BeniLink ?{' '}
          <button
            type="button"
            onClick={() => navigate('register')}
            className="font-bold text-[#006191] underline underline-offset-2 hover:text-[#084d82]"
          >
            Créer un compte
          </button>
        </p>
      )}

      {import.meta.env.DEV && isTeam && enterDevPreview && (
        <div className="mt-6 rounded-2xl border border-dashed border-[#006191]/35 bg-[#edf4ff] p-4 text-center">
          <p className="text-xs font-bold text-[#006191]">
            Mode aperçu local (développement uniquement)
          </p>
          <p className="mt-1 text-xs text-[#4c657a]">
            Visualisez l'interface {isAdmin ? 'Administrateur' : 'Agent terrain'} avec des données de démonstration locales.
          </p>
          <button
            type="button"
            onClick={() => enterDevPreview(isAdmin ? 'ADMIN' : 'OPERATOR')}
            className="mt-3 w-full rounded-full border border-[#006191] bg-white px-4 py-2.5 text-xs font-bold text-[#006191] transition hover:bg-[#e3efff]"
          >
            Aperçu local {isAdmin ? 'Console Admin' : 'Espace Agent'} (données démo)
          </button>
        </div>
      )}
    </AuthPageLayout>
  );
};
