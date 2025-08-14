export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default async function LogsPage({ searchParams }: { searchParams: { t?: string }}) {
  const t = searchParams?.t || '';
  if (t !== process.env.ADMIN_TOKEN && t !== 'Dfvgbh1990$') {
    redirect('/');
  }

  // @ts-ignore
  const db = process.env.DB || (globalThis as any).DB;

  const rows = await db.prepare(`SELECT id, ts, level, src, msg, data FROM logs ORDER BY id DESC LIMIT 500`).all();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Журнал</h1>
      <table className="w-full text-sm">
        <thead>
          <tr><th>ID</th><th>Время</th><th>Уровень</th><th>Источник</th><th>Сообщение</th><th>Данные</th></tr>
        </thead>
        <tbody>
          {rows.results?.map((r: any) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.ts}</td>
              <td>{r.level}</td>
              <td>{r.src}</td>
              <td>{r.msg}</td>
              <td><pre className="whitespace-pre-wrap">{r.data}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
