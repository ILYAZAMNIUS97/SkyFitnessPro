import Head from 'next/head';
import Layout from '@/components/Layout';
import styles from '@/styles/Profile.module.css';

export default function Profile() {
  return (
    <Layout>
      <Head>
        <title>Профиль - SkyFitnessPro</title>
        <meta name="description" content="Личный кабинет пользователя" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>

      <div className={styles.container}>
        <div className={styles.comingSoon}>
          <div className={styles.icon}>👤</div>
          <h1 className={styles.title}>Личный кабинет</h1>
          <p className={styles.description}>
            Эта страница находится в разработке. Скоро здесь появится:
          </p>
          <ul className={styles.featuresList}>
            <li>📊 Статистика тренировок</li>
            <li>🎯 Отслеживание прогресса</li>
            <li>💪 Мои курсы</li>
            <li>⚙️ Настройки профиля</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
