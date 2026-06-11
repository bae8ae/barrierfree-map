import { useMemo, useState } from 'react';
import type { GuardianAlertKey, GuardianSharePhase } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton, SectionTitle } from '@/components/common/ui';
import { useStore } from '@/store/useStore';
import { MVP_TEST_BADGE } from '@/data/region';
import {
  MOCK_PROTECTED_USER,
  MOCK_GUARDIANS,
  GUARDIAN_ALERTS,
  GUARDIAN_FUTURE_FEATURES,
} from '@/data/mockGuardian';

// ============================================================
// 보호자 안심 공유 모드 (마이 탭 안의 "안심 공유" 섹션)
// 실제 GPS·문자 발송 없이 Mock 흐름으로
// "공유 전 → 이동 중 → 목적지 도착 → 공유 종료"를 보여준다.
//
// 보호자 공유 모드는 사용자를 감시하기 위한 기능이 아니라,
// 사용자가 원할 때 안전한 독립 이동을 돕는 선택형 기능이다.
// ============================================================

const PHASE_META: Record<
  GuardianSharePhase,
  { label: string; color: string; bg: string; desc: string }
> = {
  idle: {
    label: '공유 전',
    color: '#5b6675',
    bg: '#eef0ee',
    desc: '아직 위치를 공유하고 있지 않아요.',
  },
  moving: {
    label: '이동 중',
    color: '#0a8174',
    bg: '#dcf3ee',
    desc: '보호자에게 실시간 이동 상태를 공유하고 있어요.',
  },
  arrived: {
    label: '목적지 도착',
    color: '#16a35e',
    bg: '#dcfce9',
    desc: '목적지에 안전하게 도착했어요.',
  },
  ended: {
    label: '공유 종료',
    color: '#5b6675',
    bg: '#eef0ee',
    desc: '이번 이동의 위치 공유가 종료되었어요.',
  },
};

export function GuardianScreen() {
  const showToast = useStore((s) => s.showToast);

  const [phase, setPhase] = useState<GuardianSharePhase>('idle');
  const [consentOpen, setConsentOpen] = useState(false);
  const [alerts, setAlerts] = useState<Record<GuardianAlertKey, boolean>>(() =>
    GUARDIAN_ALERTS.reduce(
      (acc, a) => {
        acc[a.key] = a.defaultOn;
        return acc;
      },
      {} as Record<GuardianAlertKey, boolean>,
    ),
  );

  const sharing = phase === 'moving' || phase === 'arrived';

  const startShare = () => {
    setConsentOpen(false);
    setPhase('moving');
    showToast('위치 공유를 시작했어요. 보호자에게 이동 상태가 전달됩니다.', 'success');
  };

  const stopShare = () => {
    setPhase('ended');
    showToast('위치 공유를 중단했어요.', 'info');
  };

  const markArrived = () => {
    setPhase('arrived');
    showToast('목적지 도착 알림을 보호자에게 보냈어요.', 'success');
  };

  const resetShare = () => setPhase('idle');

  const toggleAlert = (key: GuardianAlertKey) =>
    setAlerts((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8 pt-3">
        {/* 안내 배너 */}
        <div className="mb-3 rounded-2xl bg-primary-600 p-4 text-white shadow-card">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={20} />
            <p className="text-sm font-extrabold">보호자 안심 공유</p>
            <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
              {MVP_TEST_BADGE}
            </span>
          </div>
          <p className="mt-1.5 text-xs font-medium leading-snug text-white/90">
            감시가 아니라, 원할 때 켜는 안전장치예요. 사용자가 직접 시작한 경우에만
            위치가 공유되고 언제든 중단할 수 있어요.
          </p>
        </div>

        {/* 1. 현재 이동 상태 카드 */}
        <StatusCard phase={phase} />

        {/* 2. 목적지 + 예상 도착 시간 */}
        <DestinationCard phase={phase} />

        {/* 3. 보호자에게 보이는 화면 */}
        <GuardianView phase={phase} alerts={alerts} />

        {/* 4. 등록된 보호자 */}
        <SectionTitle style={{ marginTop: 20 }} hint={`${MOCK_GUARDIANS.length}명`}>
          등록된 보호자
        </SectionTitle>
        <div className="space-y-2">
          {MOCK_GUARDIANS.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Icon name="shield" size={20} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">
                  {g.name}{' '}
                  <span className="text-xs font-medium text-subtle">· {g.relation}</span>
                </p>
                <p className="text-xs font-medium text-subtle">{g.phoneMasked}</p>
              </div>
              {sharing && (
                <span className="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-bold text-primary-700">
                  공유 중
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 5. 알림 설정 */}
        <SectionTitle style={{ marginTop: 20 }}>알림 설정</SectionTitle>
        <div className="space-y-2 rounded-2xl bg-white p-3 shadow-card">
          {GUARDIAN_ALERTS.map((a) => (
            <label
              key={a.key}
              className="flex items-center gap-3 rounded-xl px-1 py-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Icon name={a.icon} size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-ink">{a.label}</span>
                <span className="block text-[11px] font-medium text-subtle">{a.desc}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={alerts[a.key]}
                aria-label={a.label}
                onClick={() => toggleAlert(a.key)}
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                style={{ background: alerts[a.key] ? '#0e9e8b' : '#cfc9bb' }}
              >
                <span
                  className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
                  style={{ left: alerts[a.key] ? '26px' : '4px' }}
                />
              </button>
            </label>
          ))}
        </div>

        {/* 6. 공유 시작/중단 + 응급 */}
        <div className="mt-5 space-y-2.5">
          {!sharing ? (
            <PrimaryButton icon="location" onClick={() => setConsentOpen(true)}>
              {phase === 'ended' ? '다시 위치 공유 시작' : '위치 공유 시작'}
            </PrimaryButton>
          ) : (
            <>
              {phase === 'moving' && (
                <PrimaryButton icon="location" variant="outline" onClick={markArrived}>
                  목적지 도착 처리 (시뮬레이션)
                </PrimaryButton>
              )}
              <PrimaryButton icon="shield" variant="outline" onClick={stopShare}>
                위치 공유 중단
              </PrimaryButton>
            </>
          )}

          {phase === 'arrived' && (
            <PrimaryButton icon="shield" onClick={resetShare}>
              공유 종료하고 처음으로
            </PrimaryButton>
          )}

          <button
            type="button"
            onClick={() =>
              showToast('응급 알림을 등록된 보호자 전원에게 보냈어요. (데모)', 'warn')
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d9573f] px-5 py-3.5 text-base font-bold text-white transition-colors active:scale-[0.98] hover:bg-[#c64b34]"
          >
            <Icon name="warning" size={20} />
            응급 알림 보내기
          </button>
        </div>

        {/* 7. 향후 고도화 기능 (선택형) */}
        <FutureFeaturesCard />
      </div>

      {/* 개인정보 동의 모달 */}
      <ConsentModal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        onAgree={startShare}
      />
    </div>
  );
}

function StatusCard({ phase }: { phase: GuardianSharePhase }) {
  const meta = PHASE_META[phase];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink">현재 이동 상태</p>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-extrabold"
          style={{ color: meta.color, background: meta.bg }}
        >
          {meta.label}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-medium leading-snug text-subtle">{meta.desc}</p>
      {/* 단계 진행 표시 */}
      <div className="mt-3 flex items-center gap-1">
        {(['idle', 'moving', 'arrived', 'ended'] as GuardianSharePhase[]).map((p, i) => {
          const order: GuardianSharePhase[] = ['idle', 'moving', 'arrived', 'ended'];
          const active = order.indexOf(phase) >= i;
          return (
            <div
              key={p}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: active ? '#0e9e8b' : '#e3ded3' }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-bold text-subtle">
        <span>공유 전</span>
        <span>이동 중</span>
        <span>도착</span>
        <span>종료</span>
      </div>
    </div>
  );
}

function DestinationCard({ phase }: { phase: GuardianSharePhase }) {
  const u = MOCK_PROTECTED_USER;
  return (
    <div className="mt-3 rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icon name="location" size={18} />
        </span>
        <div className="flex-1">
          <p className="text-[11px] font-medium text-subtle">출발 → 목적지</p>
          <p className="text-sm font-bold text-ink">
            {u.origin} → {u.destination}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-cream px-3 py-2.5">
          <p className="text-[11px] font-medium text-subtle">예상 도착 시간</p>
          <p className="text-lg font-extrabold text-ink">
            {phase === 'arrived' ? '도착 완료' : `약 ${u.etaMinutes}분`}
          </p>
        </div>
        <div className="rounded-xl bg-cream px-3 py-2.5">
          <p className="text-[11px] font-medium text-subtle">이동 모드</p>
          <p className="text-lg font-extrabold text-ink">{u.mode}</p>
        </div>
      </div>
    </div>
  );
}

function GuardianView({
  phase,
  alerts,
}: {
  phase: GuardianSharePhase;
  alerts: Record<GuardianAlertKey, boolean>;
}) {
  const u = MOCK_PROTECTED_USER;
  const messages = useMemo(() => {
    switch (phase) {
      case 'moving':
        return [
          `${u.name}님이 ${u.destination} 방향으로 이동 중입니다.`,
          ...(alerts.riskZone ? ['현재 위험 제보 구역을 우회 중입니다.'] : []),
        ];
      case 'arrived':
        return ['목적지에 도착했습니다.'];
      case 'ended':
        return ['위치 공유가 종료되었습니다.'];
      default:
        return ['아직 공유가 시작되지 않았습니다.'];
    }
  }, [phase, alerts.riskZone, u.name, u.destination]);

  return (
    <div className="mt-3 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/60 p-4">
      <div className="flex items-center gap-2">
        <Icon name="shield" size={16} />
        <p className="text-xs font-extrabold text-primary-700">보호자에게 보이는 화면 (미리보기)</p>
      </div>
      <div className="mt-2.5 rounded-2xl bg-white p-3 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Icon name="wheelchair" size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{u.name}님</p>
            <p className="text-[11px] font-medium text-subtle">{u.mode} · 안심 공유 중</p>
          </div>
        </div>
        <div className="mt-2.5 space-y-1.5">
          {messages.map((m, i) => (
            <p
              key={i}
              className="rounded-xl bg-cream px-3 py-2 text-[13px] font-semibold leading-snug text-ink"
            >
              {m}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function FutureFeaturesCard() {
  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-card">
        <div className="flex items-center gap-2">
          <p className="text-sm font-extrabold text-ink">
            향후 고도화 기능 (선택형 검토 예정)
          </p>
        </div>
        <p className="mt-1 text-[12px] font-medium leading-snug text-subtle">
          안전에 필요한 기본 보호자 공유 기능은 앞으로도 무료로 제공됩니다. 아래 기능은
          향후 선택형 기능으로 검토하고 있어요.
        </p>
        <ul className="mt-3 space-y-1.5">
          {GUARDIAN_FUTURE_FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2 text-[13px] font-semibold text-subtle"
            >
              <span aria-hidden>○</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const CONSENT_ITEMS = [
  '위치 공유에 동의합니다.',
  '보호자에게 도착 여부와 이상 상황 알림을 전송하는 것에 동의합니다.',
  '언제든지 공유를 중단할 수 있음을 확인했습니다.',
];

function ConsentModal({
  open,
  onClose,
  onAgree,
}: {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}) {
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const allChecked = checked.every(Boolean);

  const toggle = (i: number) =>
    setChecked((p) => p.map((c, idx) => (idx === i ? !c : c)));

  return (
    <Modal open={open} onClose={onClose} title="위치 공유 개인정보 동의">
      <div className="space-y-4 pb-2">
        <div className="rounded-2xl bg-primary-50 p-3.5 text-[13px] font-semibold leading-relaxed text-primary-700">
          <p>• 위치 공유는 사용자가 직접 시작한 경우에만 활성화됩니다.</p>
          <p>• 공유 대상·공유 시간·공유 범위를 확인할 수 있습니다.</p>
          <p>• 언제든지 공유를 중단할 수 있습니다.</p>
          <p>• 위치 데이터는 목적 달성 후 최소한으로만 보관됩니다.</p>
          <p className="mt-1.5 text-primary-800">
            보호자 공유 모드는 사용자를 감시하기 위한 기능이 아니라, 사용자가 원할 때
            안전한 독립 이동을 돕는 선택형 기능입니다.
          </p>
        </div>

        {/* 공유 요약 */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-cream px-2 py-2.5">
            <p className="text-[10px] font-medium text-subtle">공유 대상</p>
            <p className="text-xs font-bold text-ink">보호자 {MOCK_GUARDIANS.length}명</p>
          </div>
          <div className="rounded-xl bg-cream px-2 py-2.5">
            <p className="text-[10px] font-medium text-subtle">공유 시간</p>
            <p className="text-xs font-bold text-ink">이동 중에만</p>
          </div>
          <div className="rounded-xl bg-cream px-2 py-2.5">
            <p className="text-[10px] font-medium text-subtle">공유 범위</p>
            <p className="text-xs font-bold text-ink">현재 위치·도착</p>
          </div>
        </div>

        {/* 체크박스 3개 */}
        <div className="space-y-2">
          {CONSENT_ITEMS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={checked[i]}
              className="flex w-full items-start gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition-colors"
              style={{
                borderColor: checked[i] ? '#0e9e8b' : '#e3ded3',
                background: checked[i] ? '#e6f7f4' : '#fff',
              }}
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold text-white"
                style={{
                  borderColor: checked[i] ? '#0e9e8b' : '#cfc9bb',
                  background: checked[i] ? '#0e9e8b' : '#fff',
                }}
              >
                {checked[i] ? '✓' : ''}
              </span>
              <span className="text-[13px] font-semibold text-ink">{item}</span>
            </button>
          ))}
        </div>

        <PrimaryButton icon="location" disabled={!allChecked} onClick={onAgree}>
          {allChecked ? '동의하고 위치 공유 시작' : '모든 항목에 동의해주세요'}
        </PrimaryButton>
      </div>
    </Modal>
  );
}
