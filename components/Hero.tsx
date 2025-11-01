import Link from "next/link";

export default function Hero() {
  return (
    <section className="border-b">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Nadoo — аренда вещей и быстрые задания рядом
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Сдавайте вещи в аренду, находите исполнителей для задач и зарабатывайте. Безопасно, удобно и рядом с вами.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/post-item" className="rounded-lg px-4 py-2 bg-black text-white text-sm font-medium">
            Сдать в аренду
          </Link>
          <Link href="/post-task" className="rounded-lg px-4 py-2 border text-sm font-medium">
            Разместить задание
          </Link>
        </div>
      </div>
    </section>
  );
}
