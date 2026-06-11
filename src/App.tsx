import { useEffect, useState } from 'react';
import type { CommunityPost, PublicFacility } from '@/types';
import { useStore } from '@/store/useStore';
import { AppLayout } from '@/components/layout/AppLayout';
import type { TabKey } from '@/components/layout/BottomNavigation';
import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { MapScreen } from '@/components/map/MapScreen';
import { RouteScreen } from '@/components/route/RouteScreen';
import { CommunityHub } from '@/components/community/CommunityHub';
import { MyScreen, type MySection } from '@/components/my/MyScreen';
import { FacilityDetailModal } from '@/components/facility/FacilityDetailModal';
import {
  CommunityComposer,
  type ComposerPrefill,
} from '@/components/community/CommunityComposer';

// ============================================================
// BarrierFree Map · 앱 루트
// "시설이 있다는 것보다 중요한 건, 지금 실제로 이동할 수 있는지입니다."
// 공공데이터는 시설의 존재를, 커뮤니티는 실제 이용 가능 여부를 알려줍니다.
// ============================================================

export default function App() {
  const init = useStore((s) => s.init);
  const loaded = useStore((s) => s.loaded);
  const focusPostOnMap = useStore((s) => s.focusPostOnMap);

  const [tab, setTab] = useState<TabKey>('map');
  const [mySection, setMySection] = useState<MySection>('profile');
  const [communityComposerOpen, setCommunityComposerOpen] = useState(false);
  const [prefill, setPrefill] = useState<ComposerPrefill | undefined>(undefined);

  useEffect(() => {
    init();
  }, [init]);

  // 지도 플로팅/바텀시트 "불편 제보하기" → 커뮤니티 작성(실시간 제보)
  const openReportComposer = () => {
    setPrefill({ type: 'report' });
    setCommunityComposerOpen(true);
  };

  // 시설 상세 "이 시설 상태 공유하기" → 커뮤니티 작성(시설 상태, 시설 연결)
  const openShareStatus = (facility: PublicFacility) => {
    setPrefill({
      type: 'facility_status',
      facilityId: facility.id,
      locationName: facility.name,
      lat: facility.lat,
      lng: facility.lng,
    });
    setCommunityComposerOpen(true);
  };

  // 커뮤니티 "지도에서 보기" → 지도 탭 이동 + 해당 위치 포커스
  const viewPostOnMap = (post: CommunityPost) => {
    focusPostOnMap(post.id);
    setTab('map');
  };

  // 보호자 질문(도착 알림 등) → 마이 탭의 안심 공유 섹션으로 바로 이동
  const openGuardian = () => {
    setMySection('guardian');
    setTab('my');
  };

  return (
    <AppLayout active={tab} onChange={setTab}>
      {!loaded ? (
        <LoadingScreen />
      ) : (
        <>
          <Pane show={tab === 'map'}>
            <MapScreen onRoute={() => setTab('route')} onReport={openReportComposer} />
          </Pane>
          <Pane show={tab === 'route'}>
            <RouteScreen />
          </Pane>
          <Pane show={tab === 'community'}>
            <CommunityHub
              composerOpen={communityComposerOpen && tab === 'community'}
              setComposerOpen={setCommunityComposerOpen}
              onViewOnMap={viewPostOnMap}
              onOpenGuardian={openGuardian}
            />
          </Pane>
          <Pane show={tab === 'my'}>
            <MyScreen section={mySection} onSectionChange={setMySection} />
          </Pane>
        </>
      )}

      {/* 시설 상세는 전역 (지도·시설 화면 어디서든 열림) */}
      <FacilityDetailModal
        onReportProblem={openReportComposer}
        onShareStatus={openShareStatus}
      />

      {/*
        커뮤니티 작성 모달 (전역).
        커뮤니티 탭 자체 플로팅 버튼은 CommunityScreen 내부 모달이 담당하고,
        지도/시설 등 다른 화면에서 호출될 때는 이 전역 모달이 prefill 과 함께 연다.
      */}
      {tab !== 'community' && (
        <Modal
          open={communityComposerOpen}
          onClose={() => setCommunityComposerOpen(false)}
          title="정보 공유하기"
        >
          <CommunityComposer
            prefill={prefill}
            onDone={() => setCommunityComposerOpen(false)}
          />
        </Modal>
      )}
    </AppLayout>
  );
}

function Pane({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ display: show ? 'block' : 'none' }} aria-hidden={!show}>
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-warmwhite">
      <div className="flex h-16 w-16 animate-idleBob items-center justify-center rounded-full bg-primary-500 text-white shadow-float">
        <Icon name="route" size={30} />
      </div>
      <p className="text-sm font-bold text-primary-700">접근성 정보를 불러오는 중…</p>
      <p className="text-xs text-subtle">공공 시설 데이터 + 실시간 제보 결합 중</p>
    </div>
  );
}
