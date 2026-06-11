import { useState } from 'react';
import type { CommunityPost } from '@/types';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SegmentedControl } from '@/components/common/ui';
import { CommunityScreen } from '@/components/community/CommunityScreen';
import { FacilityScreen } from '@/components/facility/FacilityScreen';

// ============================================================
// 커뮤니티·시설 통합 탭
// 하나의 탭 안에서 세그먼트로 "커뮤니티 / 시설 정보"를 전환한다.
// ============================================================

type Section = 'community' | 'facility';

const SUBTITLE: Record<Section, string> = {
  community: '지금 이용 가능한지, 함께 확인해요.',
  facility: '공공 데이터와 실이용 후기를 함께',
};

export function CommunityHub({
  composerOpen,
  setComposerOpen,
  onViewOnMap,
}: {
  composerOpen: boolean;
  setComposerOpen: (v: boolean) => void;
  onViewOnMap: (post: CommunityPost) => void;
}) {
  const [section, setSection] = useState<Section>('community');

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="커뮤니티·시설" subtitle={SUBTITLE[section]} />

      <div className="px-4 pt-3">
        <SegmentedControl
          ariaLabel="커뮤니티·시설 전환"
          value={section}
          onChange={setSection}
          options={[
            { key: 'community', label: '커뮤니티', icon: 'help' },
            { key: 'facility', label: '시설 정보', icon: 'building' },
          ]}
        />
      </div>

      <div className="relative flex-1 overflow-hidden">
        {section === 'community' ? (
          <CommunityScreen
            composerOpen={composerOpen}
            setComposerOpen={setComposerOpen}
            onViewOnMap={onViewOnMap}
          />
        ) : (
          <FacilityScreen />
        )}
      </div>
    </div>
  );
}
