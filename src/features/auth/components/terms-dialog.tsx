"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const TermsDialog = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>서비스 이용약관</DialogTitle>
          <DialogDescription>
            review-ad 서비스 이용약관을 확인해주세요.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2">제1조 (목적)</h3>
              <p className="text-slate-600 leading-relaxed">
                본 약관은 review-ad(이하 "회사")가 제공하는 블로그 체험단 매칭 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">제2조 (정의)</h3>
              <p className="text-slate-600 leading-relaxed">
                1. "서비스"란 회사가 제공하는 광고주와 인플루언서를 연결하는 체험단 매칭 플랫폼을 의미합니다.
                <br />
                2. "회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.
                <br />
                3. "광고주"란 체험단을 모집하고 캠페인을 진행하는 회원을 의미합니다.
                <br />
                4. "인플루언서"란 체험단에 지원하고 콘텐츠를 제작하는 회원을 의미합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">제3조 (약관의 효력 및 변경)</h3>
              <p className="text-slate-600 leading-relaxed">
                1. 본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.
                <br />
                2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
                <br />
                3. 약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 공지합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">제4조 (회원가입)</h3>
              <p className="text-slate-600 leading-relaxed">
                1. 회원가입은 이용자가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                <br />
                2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                <br />
                - 가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우
                <br />
                - 실명이 아니거나 타인의 명의를 이용한 경우
                <br />- 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">제5조 (서비스의 제공)</h3>
              <p className="text-slate-600 leading-relaxed">
                1. 회사는 회원에게 다음과 같은 서비스를 제공합니다.
                <br />
                - 체험단 캠페인 등록 및 관리 서비스
                <br />
                - 체험단 지원 및 매칭 서비스
                <br />
                - 회원 간 소통 및 거래 중개 서비스
                <br />
                - 기타 회사가 정하는 서비스
                <br />
                2. 회사는 서비스의 품질 향상을 위하여 서비스의 내용을 변경할 수 있습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">제6조 (회원의 의무)</h3>
              <p className="text-slate-600 leading-relaxed">
                1. 회원은 다음 행위를 하여서는 안 됩니다.
                <br />
                - 신청 또는 변경 시 허위내용의 등록
                <br />
                - 타인의 정보 도용
                <br />
                - 회사가 게시한 정보의 변경
                <br />
                - 회사가 정한 정보 이외의 정보 등의 송신 또는 게시
                <br />
                - 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해
                <br />- 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">제7조 (회원탈퇴 및 자격 상실)</h3>
              <p className="text-slate-600 leading-relaxed">
                1. 회원은 언제든지 회원탈퇴를 요청할 수 있으며, 회사는 즉시 회원탈퇴를 처리합니다.
                <br />
                2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.
                <br />
                - 가입 신청 시에 허위 내용을 등록한 경우
                <br />
                - 다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우
                <br />- 서비스를 이용하여 법령 또는 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const PrivacyDialog = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>개인정보 처리방침</DialogTitle>
          <DialogDescription>
            review-ad 개인정보 처리방침을 확인해주세요.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. 개인정보의 수집 및 이용 목적</h3>
              <p className="text-slate-600 leading-relaxed">
                회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                <br />
                <br />
                가. 회원 가입 및 관리
                <br />
                회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적으로 개인정보를 처리합니다.
                <br />
                <br />
                나. 재화 또는 서비스 제공
                <br />
                물품배송, 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증 등을 목적으로 개인정보를 처리합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. 수집하는 개인정보 항목</h3>
              <p className="text-slate-600 leading-relaxed">
                회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
                <br />
                <br />
                가. 필수항목
                <br />
                - 이름, 이메일, 휴대폰번호, 비밀번호
                <br />
                <br />
                나. 선택항목
                <br />
                - 프로필 사진, SNS 계정 정보, 블로그 주소
                <br />
                <br />
                다. 자동 수집 항목
                <br />- 접속 IP 정보, 쿠키, 서비스 이용 기록, 방문 기록
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. 개인정보의 보유 및 이용기간</h3>
              <p className="text-slate-600 leading-relaxed">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                <br />
                <br />
                가. 회원 정보
                <br />
                - 보유기간: 회원 탈퇴 시까지
                <br />
                - 다만, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지 보관
                <br />
                <br />
                나. 거래 정보
                <br />
                - 전자상거래법에 따라 계약 또는 청약철회 등에 관한 기록: 5년
                <br />- 대금결제 및 재화 등의 공급에 관한 기록: 5년
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. 개인정보의 제3자 제공</h3>
              <p className="text-slate-600 leading-relaxed">
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. 개인정보의 파기</h3>
              <p className="text-slate-600 leading-relaxed">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                <br />
                <br />
                가. 파기절차
                <br />
                회원이 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.
                <br />
                <br />
                나. 파기방법
                <br />
                - 전자적 파일 형태: 복구 및 재생이 불가능하도록 안전하게 삭제
                <br />- 종이 문서: 분쇄기로 분쇄하거나 소각
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. 정보주체의 권리·의무 및 행사방법</h3>
              <p className="text-slate-600 leading-relaxed">
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
                <br />
                1. 개인정보 열람 요구
                <br />
                2. 오류 등이 있을 경우 정정 요구
                <br />
                3. 삭제요구
                <br />
                4. 처리정지 요구
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. 개인정보 보호책임자</h3>
              <p className="text-slate-600 leading-relaxed">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                <br />
                <br />
                개인정보 보호책임자
                <br />
                - 성명: review-ad 관리자
                <br />- 이메일: privacy@review-ad.com
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
