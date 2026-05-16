// 마스터 패스워드 입력 DTO. NFKC 정규화와 trim 은 컨트롤러에서 적용된다.
import { IsString, MaxLength, MinLength } from 'class-validator';

export class MasterDto {
  @IsString()
  @MinLength(12, { message: '마스터 패스워드는 최소 12자 이상이어야 합니다.' })
  @MaxLength(256, { message: '마스터 패스워드는 256자 이하여야 합니다.' })
  master!: string;
}
