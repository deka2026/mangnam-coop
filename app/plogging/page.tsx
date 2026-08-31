import type { Metadata } from "next";
import ParticipateForm from "../components/ParticipateForm";

export const metadata: Metadata = {
  title: "플로깅 신청 | 망남마을협동조합",
  description:
    "완도 망남 바닷가를 걸으며 쓰레기를 줍는 플로깅. 마을과 바다를 함께 돌보는 참여 프로그램에 신청하세요.",
};

export default function Page() {
  return (
    <>
      <section className="border-b border-sea-100 bg-sea-50">
        <div className="container-page py-14">
          <p className="font-semibold text-sea-600">참여 · 플로깅</p>
          <h1 className="mt-2 section-title text-3xl">🧹 망남 바닷가 플로깅</h1>
          <p className="section-sub">
            플로깅은 걷거나 뛰면서 쓰레기를 줍는 활동입니다. 전복의 마을 망남의 해변을
            걸으며 바다 쓰레기를 줍고, 마을과 바다를 함께 돌봅니다. 주민·방문객 누구나
            참여할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div>
            <h2 className="font-bold text-sea-800 text-lg">이렇게 진행됩니다</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-700">
              <li>• 코스: 망남 해변 일대 (당일 안내)</li>
              <li>• 준비물: 편한 옷과 운동화 — 집게·장갑·봉투는 마을에서 준비합니다.</li>
              <li>• 주운 쓰레기는 마을에서 분리·처리하고, 활동 기록은 마을 소식으로 공유합니다.</li>
              <li>• 일정·집합 장소 등 상세 안내는 신청 접수 후 연락드립니다.</li>
            </ul>
            <div className="mt-8">
              <h2 className="font-bold text-sea-800 text-lg">참여 신청</h2>
              <p className="mt-1 text-sm text-sea-600">
                신청 내용은 접수 즉시 운영진에게 전달되며, 확인 후 연락드립니다.
              </p>
              <div className="mt-4">
                <ParticipateForm
                  program="plogging"
                  programLabel="플로깅 참여 신청"
                  extraFields={[
                    { id: "date", label: "희망 날짜", type: "date" },
                    { id: "people", label: "참여 인원", placeholder: "예: 2명" },
                  ]}
                />
              </div>
            </div>
          </div>
          <aside className="card h-fit bg-earth-50 ring-earth-100">
            <h3 className="font-bold text-sea-800">왜 플로깅인가요?</h3>
            <p className="mt-2 text-sm leading-relaxed text-sea-700">
              전복 양식의 마을에게 깨끗한 바다는 곧 생계입니다. 해변에 밀려온 쓰레기를
              줍는 한 시간이 마을의 바다를 지키고, 걷는 사람에게는 운동이 됩니다.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
