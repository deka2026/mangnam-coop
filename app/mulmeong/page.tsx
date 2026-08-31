import type { Metadata } from "next";
import ParticipateForm from "../components/ParticipateForm";

export const metadata: Metadata = {
  title: "별달물멍 스팟예약 | 망남마을협동조합",
  description:
    "별과 달, 그리고 밤바다를 바라보며 쉬어가는 망남의 별달물멍 스팟. 조용한 밤바다 명당을 예약하세요.",
};

export default function Page() {
  return (
    <>
      <section className="border-b border-sea-100 bg-sea-50">
        <div className="container-page py-14">
          <p className="font-semibold text-sea-600">참여 · 별달물멍</p>
          <h1 className="mt-2 section-title text-3xl">🌌 별달물멍 스팟예약</h1>
          <p className="section-sub">
            별멍, 달멍, 물멍 — 망남의 밤바다는 불빛이 적어 별과 달이 잘 보입니다.
            바다를 바라보며 아무것도 하지 않을 자유를 누릴 수 있는 마을의 조용한
            스팟을 예약제로 안내합니다.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div>
            <h2 className="font-bold text-sea-800 text-lg">이용 안내</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-700">
              <li>• 스팟 위치는 예약 확정 시 안내합니다 (마을 해변 일대의 조용한 자리).</li>
              <li>• 밤 시간대 이용이므로 안전을 위해 예약제로 운영합니다.</li>
              <li>• 날씨(구름·바람)에 따라 일정 변경을 안내드릴 수 있습니다.</li>
              <li>• 이용 요금 등 상세 운영 안내는 신청 접수 후 연락드립니다.</li>
            </ul>
            <div className="mt-8">
              <h2 className="font-bold text-sea-800 text-lg">스팟 예약</h2>
              <p className="mt-1 text-sm text-sea-600">
                신청 내용은 접수 즉시 운영진에게 전달되며, 확인 후 예약 확정 연락을
                드립니다.
              </p>
              <div className="mt-4">
                <ParticipateForm
                  program="mulmeong"
                  programLabel="별달물멍 스팟예약"
                  extraFields={[
                    { id: "date", label: "희망 날짜", type: "date" },
                    { id: "time", label: "희망 시간대", placeholder: "예: 저녁 8시쯤" },
                    { id: "people", label: "인원", placeholder: "예: 2명" },
                  ]}
                />
              </div>
            </div>
          </div>
          <aside className="card h-fit bg-earth-50 ring-earth-100">
            <h3 className="font-bold text-sea-800">별달물멍이 뭔가요?</h3>
            <p className="mt-2 text-sm leading-relaxed text-sea-700">
              별을 보며 멍하니(별멍), 달을 보며 멍하니(달멍), 물결을 보며 멍하니(물멍) —
              도시에서는 어려운 쉼을 망남의 밤바다가 내어드립니다.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
