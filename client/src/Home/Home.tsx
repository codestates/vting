import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store/index";
import "./Home.scss";
import { Link } from "react-router-dom";

axios.defaults.withCredentials = true;

interface Props {
  text: string;
}

function Home({ text }: Props) {
  const isLogin = useSelector((state: RootState) => state.isLogin);

  return (
    <div className="homeCon">
      <div className="hotVotesTitle">
        {isLogin ? (
          <div>
            <span>😂 user님, 요즘 </span>
            <select id="newVoteFilter">
              <option value="newest">트렌디한</option>
              <option value="most">대세를 따르는</option>
              <option value="diff">나만의 생각을 가진</option>
            </select>
            <span> 사람들은 이런 설문 한대요! 😂</span>
          </div>
        ) : (
          <div>
            <span>😂 요즘 </span>
            <select id="newVoteFilter">
              <option value="newest">트렌디한</option>
              <option value="most">대세를 따르는</option>
              <option value="diff">나만의 생각을 가진</option>
            </select>
            <span> 사람들은 이런 설문 한대요! 😂</span>
          </div>
        )}
      </div>
      <div className="hotVotes">
        <div className="hotVotesContents">
          <div className="hotVoteCard">
            <div className="hotVoteCardTitle">엄마가 좋아 아빠가 좋아?</div>
            <div className="hotVoteCardFormat">대결형</div>
            <div className="hotVoteCardCount">79명 참여 중</div>
          </div>
          <div className="hotVoteCard">
            <div className="hotVoteCardTitle">오늘 점심 메뉴</div>
            <div className="hotVoteCardFormat">바 그래프</div>
            <div className="hotVoteCardCount">37명 참여 중</div>
          </div>
          <div className="hotVoteCard">
            <div className="hotVoteCardTitle">인생에서 가장 소중한 것은?</div>
            <div className="hotVoteCardFormat">워드클라우드</div>
            <div className="hotVoteCardCount">11명 참여 중</div>
          </div>
          <div className="hotVoteCard">
            <div className="hotVoteCardTitle">궁금한거 있어?</div>
            <div className="hotVoteCardFormat">대화창</div>
            <div className="hotVoteCardCount">124명 참여 중</div>
          </div>
        </div>
      </div>
      <Link to="/new">
        <div className="newVoteBtn vtingButton">설문 생성하기</div>
      </Link>
      <div className="services">
        <Testfunc />
      </div>
    </div>
  );
}

function Testfunc() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const serverURL: string = "https://test.v-ting.net";
  let accessToken = localStorage.getItem("accessToken");
  const [newNick, setNewNick] = useState("");

  const formData = new FormData();

  const onChangeImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files) {
      const uploadFile = e.target.files[0];
      const formData = new FormData();
      formData.append("files", uploadFile);
      console.log(formData.getAll("files"));

      await axios.patch(`${serverURL}/user/${userInfo._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
  };

  return (
    <form>
      <label htmlFor="profile-upload" />
      <input
        type="file"
        id="profile-upload"
        accept="image/*"
        onChange={(e) => onChangeImg(e)}
      />
    </form>
  );
}

Home.defaultProps = {
  text: "This is Home!",
};

export default Home;
