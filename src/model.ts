import OpenAI from "openai";
import fs from "fs";
import * as env from "dotenv";
import { ChatCompletionMessageParam } from "openai/resources";
import { getEncoding, encodingForModel } from "js-tiktoken";

// import { getEncoding, encodingForModel } from "js-tiktoken";
const enc = getEncoding("cl100k_base");
// console.log(
//   enc.decode(enc.encode("하이룽바둥~ 나는야 최강 전사 하이랜더 지니다!"))
// );

env.config();
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

const gptCall = async (messages: ChatCompletionMessageParam[]) => {
  const completion = await openai.chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0];
};
async function summary(prevText: string) {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `이 내용 한국어로 한 문장으로 요약해줘 ###\n${prevText}\n###`,
    },
  ];
  const answer = await gptCall(messages);
  return answer;
}

export async function main(purpose: string, prevText: string) {
  // const summaryText = await summary(prevText);
  // console.log(
  //   "%c 요약기록 : ",
  //   "color:yellow",
  //   `${summaryText.message.content}`
  // );
  const content = `
    넌 ${purpose}를 작성하는 사람이 됐어.
    이전의 기록은 다음과 같아. [${prevText}].  
    이전의 기록의 말투로 편지를 완성해야해. 
    이전의 기록과 다른 문장으로 대답해야만 해.
    최대 200자를 넘지 말아줘.`;
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content,
    },
  ];

  const completion = await gptCall(messages);

  console.log("%c 결과값 : ", "color:red", `${completion.message.content}`);
  const result = completion.message.content!.replace(/\n/g, "").split(".");
  const questionToken = enc.encode(content).length; // 질문 토큰
  const answerToken = enc.encode(
    completion.message.content!.replace(/\n/g, "")
  ).length; // 엔서 토큰
  tokenSave(questionToken, answerToken);
  return result;
}

const tokenSave = (questionToken: number, answerToken: number) => {
  const jsonFilePath = "tokenHistory.json";
  const obj = {
    questionToken,
    answerToken,
  };
  try {
    const transformedJSON = JSON.stringify(obj, null, 2);

    // 새로운 파일에 작성
    fs.readFile(jsonFilePath, "utf8", (err, data) => {
      if (err) throw new Error();

      const oldObj = JSON.parse(data);
      obj.questionToken = oldObj.questionToken + obj.questionToken;
      obj.answerToken = oldObj.answerToken + obj.answerToken;
    });
    fs.writeFile(jsonFilePath, transformedJSON, "utf8", (err) => {
      if (err) {
        console.error("파일에 쓰는 중 오류가 발생했습니다:", err);
        return;
      }
      console.log(`파일 변환 완료: ${jsonFilePath}`);
    });
  } catch (err) {
    console.error("JSON 형식 오류:", err);
  }
};
/**
 * 지시 = 어떤 일을 시킬지
 *
 * 문맥 = 어떤 배경을 가지고 있는지. 내가 왜 이 질문을 하는지에 대한 이유
 *
 * 예시 = 아웃풋의 방식을 어떻게 해야할지 예시 제공
 *
 * 페르소나
 *
 * 포맷 어떤 형식
 *
 * 톤 어떤 톤으로
 *
 *
 */
