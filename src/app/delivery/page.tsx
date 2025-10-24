export const dynamic = 'force-static';

export const metadata = {
  title: 'Доставка — DH22',
  description: 'Доставка DH22 — минимализм, точную посадку и доставка по России без компромиссов.',
};

export default function DeliveryPage() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-medium mb-6">Доставка</h1>

      <div className="max-w-3xl space-y-10 text-[15px] leading-relaxed">
        {/* Москва и Санкт-Петербург */}
        <section>
          <h2 className="text-xl font-medium mb-3">
            Доставка по Москве и Санкт-Петербургу (включая Московскую и Ленинградскую области)
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>С примеркой и частичным выкупом — от 200 рублей.</li>
            <li>Доставка осуществляется курьером до двери или в пункт выдачи СДЭК</li>
            <li>Срок доставки: 1–2 дня (для Санкт-Петербурга и ЛО - 2-4 дня)</li>
            <li>Оплата: картой на сайте, наличными курьеру, картой курьеру</li>
          </ul>
        </section>

        {/* Россия */}
        <section>
          <h2 className="text-xl font-medium mb-3">Доставка по России</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>С примеркой и частичным выкупом — от 250 рублей.</li>
            <li>Доставка осуществляется курьером до двери или в пункт выдачи СДЭК в вашем город</li>
            <li>Срок доставки 1–7 дней</li>
            <li>Оплата картой на сайте, наличными курьеру, картой курьеру</li>
          </ul>
        </section>

        {/* Казахстан и Беларусь */}
        <section>
          <h2 className="text-xl font-medium mb-3">Доставка в Казахстан и Беларусь</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Стоимость доставки через службу СДЭК — 900 руб.</li>
            <li>Срок доставки 1–10 дней</li>
            <li>Без возможности примерки</li>
            <li>Без возможности частичного выкупа</li>
            <li>Оплата картой на сайте</li>
          </ul>
        </section>

        {/* Другие страны */}
        <section>
          <h2 className="text-xl font-medium mb-3">Доставка в другие страны</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Стоимость доставки через службу EMS — от 1 200 руб.</li>
            <li>Срок доставки 1–14 дней</li>
            <li>Без возможности примерки</li>
            <li>Без возможности частичного выкупа</li>
            <li>Оплата картой на сайте</li>
          </ul>
        </section>
      </div>
    </section>
  );
}
