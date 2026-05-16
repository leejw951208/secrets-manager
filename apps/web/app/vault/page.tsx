// vault 메인 페이지. 상태 분기와 unlock/setup/list 화면을 한 컴포넌트가 라우팅한다.
import { VaultView } from './VaultView';

export const dynamic = 'force-dynamic';

export default function VaultPage() {
  return <VaultView />;
}
