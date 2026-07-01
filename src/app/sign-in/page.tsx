import { AuthForm } from '@/components/auth-form';
import { SiteHeader } from '@/components/site-header';

export default function SignInPage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <AuthForm />
    </div>
  );
}
