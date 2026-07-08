import { db } from '/home/z/my-project/src/lib/db.ts';

// Buscar todos los usuarios y recargarles 100000 intis (gems)
const users = await db.userState.findMany();
console.log(`Encontrados ${users.length} usuario(s)`);

for (const u of users) {
  await db.userState.update({
    where: { userId: u.userId },
    data: { gems: 100000 },
  });
  console.log(`✓ Usuario ${u.userId}: intis recargados a 100000`);
}

await db.$disconnect();
console.log('¡Listo!');
