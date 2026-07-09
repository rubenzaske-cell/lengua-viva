import { db } from '/home/z/my-project/src/lib/db.ts';

console.log('=== BASE DE DATOS EN LA NUBE (Neon) ===');
console.log('Host: ep-polished-sun-ajksq5jh-pooler.c-3.us-east-2.aws.neon.tech');
console.log('Database: neondb');
console.log('Region: US East (Ohio)');
console.log('');

const users = await db.userProfile.count();
const states = await db.userState.count();
const surveys = await db.userSurvey.count();
const lessons = await db.lessonProgress.count();
const achievements = await db.achievementProgress.count();
const streaks = await db.streakDay.count();

console.log(`UserProfile: ${users} registros`);
console.log(`UserState: ${states} registros`);
console.log(`UserSurvey: ${surveys} registros`);
console.log(`LessonProgress: ${lessons} registros`);
console.log(`AchievementProgress: ${achievements} registros`);
console.log(`StreakDay: ${streaks} registros`);
console.log('');
console.log('✅ Base de datos en la nube conectada y funcionando!');

await db.$disconnect();
