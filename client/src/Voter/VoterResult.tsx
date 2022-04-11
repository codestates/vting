import axios from "axios";
import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useParams } from "react-router-dom";
import "./voter.scss";
import logo from "../assets/yof_logo-17.jpg";
import vtCry from "../assets/vt_cry.png";
import VoterAnswer from "./VoterAnswer";
import Counter from "./Counter";
import VoterRealtime from "./VoterRealtime";
import { useSelector, useDispatch } from "react-redux";
import { patchGetVote, RootState } from "../store/index";
import Loading from "../Loading/Loading";

const adj = [
  "사랑스러운",
  "귀여운",
  "매력적인",
  "자신감있는",
  "우아한",
  "품격있는",
  "화려한",
  "고약한",
  "멋진",
  "잘생긴",
  "친절한",
  "상냥한",
  "예의바른",
  "명랑한",
  "쾌활한",
];
const animal = [
  "고양이",
  "강아지",
  "고릴라",
  "알파카",
  "거미",
  "햄스터",
  "프레리독",
  "도마뱀",
  "비단뱀",
  "기린",
  "코끼리",
  "얼룩말",
  "사자",
  "호랑이",
  "매",
  "병아리",
  "토끼",
];
function randomNick() {
  return (
    adj[Math.floor(Math.random() * adj.length)] +
    " " +
    animal[Math.floor(Math.random() * animal.length)]
  );
}

function VoterResult() {
  const [profileImg, setProfileImg] = useState(logo);
  const [title, setTitle] = useState("");
  const [nickName, setNickName] = useState(randomNick());
  const { code } = useParams();
  const [result, setResult] = useState(false);
  const [answerMode, setAnswerMode] = useState(true);
  const [errorMode, setErrorMode] = useState(false);
  const [nonUser, setNonUser] = useState(false);
  const [overtime, setOvertime] = useState(60);
  const [isLoading, setIsLoading] = useState(true);
  // const [voteData, setVoteData] = useState(dummVoteData);
  const dispatch = useDispatch();
  const voteData = useSelector((state: RootState) => state.getVote);

  useEffect(() => {
    if (code) setResult(true);
  }, [code]);

  const serverURL = process.env.REACT_APP_SERVER_URL;

  // 접속 시 해당 설문 정보 가져오기
  useEffect(() => {
    const voteResult = async () => {
      try {
        const response = await axios.get(`${serverURL}/voter/${code}`, {
          headers: {
            withCredentials: true,
          },
        });
        if (response.status === 200) {
          let getVoteBody;
          // 회원 생성한 설문일 때 body
          if (response.data.user_data) {
            getVoteBody = {
              _id: response.data.vote_data._id,
              user_id: response.data.user_data._user_id,
              image: response.data.user_data.image,
              url: response.data.vote_data.url,
              title: response.data.vote_data.title,
              format: response.data.vote_data.format,
              type: response.data.vote_data.type,
              items:
                response.data.vote_data.items ||
                response.data.vote_data.response,
              multiple: response.data.vote_data.multiple,
              manytimes: response.data.vote_data.manytimes,
              undergoing: response.data.vote_data.undergoing,
              isPublic: response.data.vote_data.isPublic,
              created_at: response.data.vote_data.created_at,
              sumCount: response.data.vote_data.sumCount || 0,
            };
          } else {
            getVoteBody = {
              _id: response.data.vote_data._id,
              url: response.data.vote_data.url,
              title: response.data.vote_data.title,
              format: response.data.vote_data.format,
              type: response.data.vote_data.type,
              items:
                response.data.vote_data.items ||
                response.data.vote_data.response,
              multiple: response.data.vote_data.multiple,
              manytimes: response.data.vote_data.manytimes,
              undergoing: response.data.vote_data.undergoing,
              created_at: response.data.vote_data.created_at,
              overtime: response.data.overtime,
              sumCount: response.data.vote_data.sumCount || 0,
            };
          }
          dispatch(patchGetVote(getVoteBody));
          setTitle(response.data.vote_data.title);
          if (!response.data.vote_data.undergoing) setErrorMode(true);
          if (response.data.user_data) {
            setNickName(response.data.user_data.nickname);
            if (
              response.data.user_data.image &&
              response.data.user_data.image.length
            )
              setProfileImg(response.data.user_data.image);
          } else {
            // 비회원 설문임
            // 1. 비회원모드 설정
            setNonUser(true);
            // 2. 남은시간 설정
            setOvertime(response.data.overtime);
          }
          setIsLoading(false);
        }
      } catch (e) {
        setIsLoading(false);
        setErrorMode(true);
      }
    };
    voteResult();
  }, []);

  return (
    <div className="votingCon">
      {isLoading ? (
        <Loading />
      ) : errorMode ? (
        <>
          <div className="voteResultContent">
            <div className="errorCon">
              <div className="imgCon">
                <img src={vtCry} alt="something wrong" />
              </div>
              <div className="errorTextCon">
                <span className="errorTitle">
                  Ooooops... Something went wrong.
                </span>
                <div className="errorSubtitle">
                  해당 코드를 가진 설문을 찾을 수 없습니다.
                </div>
                <div className="errorDescribe">
                  1. 설문 코드가 정확한지 다시 한 번 확인해주세요. <br />
                  2. 만료되거나 중지된 설문이 아닌지 확인해주세요. <br />
                  3. 일시적인 네트워크 에러일 수 있으니 잠시 후 다시
                  시도해주세요.
                </div>
                <div className="errorMailto">
                  에러가 지속된다면, 해당 접속 코드를 vting.yof@gmail.com 으로
                  보내주세요.
                  <br />
                  Vting 서비스를 유지 보수하는데에 큰 도움이 됩니다!
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="votingHeader">
            <div className="votingProfile" data-aos="flip-left">
              <div className="votingProfileImg">
                <img src={profileImg ? profileImg : logo} alt="profile" />
              </div>
              {nickName} 님의 설문입니다.
            </div>
            {nonUser ? <Counter overtime={overtime} /> : <div></div>}
          </div>
          <div className="votingTitle">{title}</div>
          {answerMode ? (
            <VoterAnswer setAnswerMode={setAnswerMode} voteData={voteData} />
          ) : (
            <VoterRealtime />
          )}
        </>
      )}
    </div>
  );
}

export default VoterResult;
