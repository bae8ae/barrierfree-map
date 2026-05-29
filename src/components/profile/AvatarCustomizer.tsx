import type { User, UserMode } from '@/types';
import { useStore } from '@/store/useStore';
import { MODE_META, MODE_ORDER } from '@/utils/meta';

// ============================================================
// 아바타 꾸미기 (캐릭터/옷 색/표정/액세서리)
// ============================================================

const OUTFIT_COLORS = ['#0e9e8b', '#8f6ae6', '#ff6b52', '#3b82f6', '#f5b921', '#16a35e'];
const EXPRESSIONS: { key: string; label: string; emoji: string }[] = [
  { key: 'smile', label: '미소', emoji: '😊' },
  { key: 'happy', label: '활짝', emoji: '😄' },
  { key: 'calm', label: '차분', emoji: '🙂' },
  { key: 'cool', label: '쿨', emoji: '😎' },
];
const ACCESSORIES: { key: string; label: string; emoji: string }[] = [
  { key: 'none', label: '없음', emoji: '—' },
  { key: 'cap', label: '모자', emoji: '🧢' },
  { key: 'scarf', label: '머플러', emoji: '🧣' },
  { key: 'flower', label: '꽃', emoji: '🌷' },
];

export function AvatarCustomizer({ avatar }: { avatar: User['avatar'] }) {
  const updateAvatar = useStore((s) => s.updateAvatar);
  const setMode = useStore((s) => s.setMode);
  const mode = useStore((s) => s.mode);

  return (
    <div className="space-y-4">
      {/* 미리보기 */}
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-primary-50 to-softblue py-6">
        <div className="relative">
          <div
            className="flex h-20 w-20 animate-idleBob items-center justify-center rounded-full border-4 border-white shadow-float"
            style={{ background: avatar.outfitColor }}
          >
            <span className="text-4xl" aria-hidden>
              {MODE_META[mode].emoji}
            </span>
          </div>
          {avatar.accessory !== 'none' && (
            <span className="absolute -right-1 -top-1 text-2xl" aria-hidden>
              {ACCESSORIES.find((a) => a.key === avatar.accessory)?.emoji}
            </span>
          )}
          <span className="absolute -bottom-1 right-0 text-xl" aria-hidden>
            {EXPRESSIONS.find((e) => e.key === avatar.expression)?.emoji}
          </span>
        </div>
        <p className="text-sm font-bold text-primary-700">{MODE_META[mode].label} 캐릭터</p>
      </div>

      {/* 캐릭터(이동 모드) */}
      <Group label="캐릭터 (이동 모드)">
        <div className="flex flex-wrap gap-2">
          {MODE_ORDER.map((m: UserMode) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className="flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-bold"
              style={{
                borderColor: mode === m ? '#0e9e8b' : '#e3ded3',
                background: mode === m ? '#e6f7f4' : '#fff',
              }}
            >
              <span aria-hidden>{MODE_META[m].emoji}</span>
              {MODE_META[m].short}
            </button>
          ))}
        </div>
      </Group>

      {/* 옷 색상 */}
      <Group label="옷 색상">
        <div className="flex flex-wrap gap-2.5">
          {OUTFIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`색상 ${c}`}
              aria-pressed={avatar.outfitColor === c}
              onClick={() => updateAvatar({ outfitColor: c })}
              className="h-10 w-10 rounded-full border-4 transition-transform active:scale-95"
              style={{ background: c, borderColor: avatar.outfitColor === c ? '#1f2a37' : '#fff' }}
            />
          ))}
        </div>
      </Group>

      {/* 표정 */}
      <Group label="표정">
        <div className="flex flex-wrap gap-2">
          {EXPRESSIONS.map((e) => (
            <ChoiceButton
              key={e.key}
              active={avatar.expression === e.key}
              onClick={() => updateAvatar({ expression: e.key })}
              emoji={e.emoji}
              label={e.label}
            />
          ))}
        </div>
      </Group>

      {/* 액세서리 */}
      <Group label="액세서리">
        <div className="flex flex-wrap gap-2">
          {ACCESSORIES.map((a) => (
            <ChoiceButton
              key={a.key}
              active={avatar.accessory === a.key}
              onClick={() => updateAvatar({ accessory: a.key })}
              emoji={a.emoji}
              label={a.label}
            />
          ))}
        </div>
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-ink">{label}</p>
      {children}
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-bold"
      style={{
        borderColor: active ? '#0e9e8b' : '#e3ded3',
        background: active ? '#e6f7f4' : '#fff',
      }}
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </button>
  );
}
