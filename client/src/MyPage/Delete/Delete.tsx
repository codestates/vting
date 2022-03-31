import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsLogin, RootState, setUserInfo } from "../../store/index";
import { useNavigate } from "react-router-dom";
import "./Delete.scss";

const serverURL: string = "https://test.v-ting.net";

function Delete() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userInfo = useSelector((state: RootState) => state.userInfo);

  useEffect(() => {
    const getUserInfo = async () => {
      let accessToken = localStorage.getItem("accessToken");
      try {
        const res = await axios.get(`${serverURL}/user/${userInfo._id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            withCredentials: true,
          },
        });
        if (res.status === 200) {
          setUserInfo({
            _id: res.data.data._id,
            nickname: res.data.data.nickname,
            email: res.data.data.email,
            image: res.data.data.image,
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUserInfo();
  }, []);

  const [modalState, setModalState] = useState<boolean>(false);

  const openModal = () => {
    setModalState(true);
  };

  const closeModal = () => {
    setModalState(false);
  };

  const deleteUser = async () => {
    let accessToken = localStorage.getItem("accessToken");
    try {
      const res = await axios.delete(serverURL + "/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          withCredentials: true,
        },
      });

      if (res.status === 200) {
        localStorage.setItem("accessToken", res.data.data.accessToken);
        console.log("회원탈퇴완료===", res.data.data);
        alert("회원탈퇴가 완료되었습니다.");
        // ? 로그아웃처리
        dispatch(setIsLogin(false));
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="delete_container">
      <header className="delete_header">
        <h1>회원탈퇴</h1>
      </header>

      <main className="delete_wrap">
        <div className="delete_profile">
          <img src={userInfo.image} alt="프로필이미지" />
        </div>
        <div className="delete_userInfo">
          <h1>닉네임 : {userInfo.nickname}</h1>
          <h1>이메일 : {userInfo.email}</h1>
        </div>
      </main>

      <div className="delete_btnWrap">
        <button className="delete_btn" onClick={openModal}>
          탈퇴하기
        </button>
      </div>
      {modalState ? (
        <div className="deleteModal_container">
          <div className="deleteModal_background">
            <div className="deleteModal_modal">
              <button className="closeBtn" onClick={closeModal}>
                X
              </button>
              <h3>
                회원정보가 삭제되면 복구되지 않습니다.
                <br />
                회원탈퇴를 진행하시겠습니까?
              </h3>
              <div className="btnWrap">
                <button className="delete_ok" onClick={() => deleteUser()}>
                  확인
                </button>
                <button className="delete_cancel" onClick={closeModal}>
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Delete;
