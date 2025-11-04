import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class TypingDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsBoolean()
  isTyping: boolean;
}
