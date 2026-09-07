import SurveyForm from "../components/SurveyForm";

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="brand-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">◔</div>
          <div className="brand-word">aloo</div>
        </div>
        <div className="header-pill">Marketing Feedback</div>
      </header>

      <section className="hero">
        <div className="eyebrow">FILIAL JAMOASI UCHUN</div>
        <h1>Filialingiz uchun marketingda nima qilishimiz kerak?</h1>
        <p>
          Qaysi ishlar foyda beryapti, qayerda kamchilik bor va sizga aynan
          qanday yordam kerak — ochiq yozing. So‘rovnoma anonim va 3–5 daqiqa oladi.
        </p>
      </section>

      <SurveyForm />
    </main>
  );
}
