import React, { useState } from "react";
import "./Edit.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState, setUserInfo } from "../../store/index";
import axios from "axios";

interface PatchUser {
  image: string;
  name: string;
  password: string;
}

const serverURL: string = "https://test.v-ting.net";

function Edit() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);

  //* 닉네임 프로필 변경
  const [patchUserInfo, setPatchUserInfo] = useState<PatchUser>({
    image: "",
    name: "",
    password: "",
  });

  const edit_onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatchUserInfo({ ...patchUserInfo, [name]: value });
  };

  const edit_onChangeProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatchUserInfo({ ...patchUserInfo, [name]: value });
  };

  const edit_onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatchUserInfo({ ...patchUserInfo, [name]: value });
  };

  // * 프로필, 닉네임, 비밀번호 변경
  const EditUserInfo = async () => {
    let accessToken = localStorage.getItem("accessToken");
    console.log("에디트 이메일===", userInfo._id);

    try {
      const res = await axios.patch(
        `${serverURL}/user/${userInfo._id}`,
        {
          nickname: patchUserInfo.name,
          password: patchUserInfo.password,
          image: patchUserInfo.image,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            withCredentials: true,
          },
        }
      );
      if (res.status === 200) {
        console.log("데이타", res.data);

        dispatch(
          setUserInfo({
            _id: String(userInfo._id),
            nickname: patchUserInfo.name || userInfo.nickname,
            email: userInfo.email,
            image: patchUserInfo.image || userInfo.image,
          })
        );
        alert("회원정보가 수정되었습니다.");
      } else {
        console.log("Bad Request 입니다. 400에러");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="edit_container">
      <header className="edit_header">
        <h1>회원정보 관리</h1>
      </header>

      <main className="edit_wrap">
        <div className="edit_userProfile">
          <div className="edit_profile">
            <h3>프로필</h3>

            <img alt="profile_img" src={patchUserInfo.image} />

            <label htmlFor="file" className="edit_btn">
              업로드
            </label>
            <input
              id="file"
              name="profile"
              onChange={edit_onChangeProfile}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="edit_userInfo">
          <div className="edit_nickname">
            <h3>닉네임 : "{userInfo.nickname}"</h3>
            <input
              name="name"
              onChange={edit_onChangeName}
              type="text"
              placeholder="변경하실 닉네임을 입력해주세요."
            />
          </div>

          <div className="edit_password">
            <h3>비밀번호</h3>
            <input
              type="password"
              name="password"
              onChange={edit_onChangePassword}
              placeholder="변경하실 비밀번호를 입력해주세요."
            />
          </div>
        </div>
      </main>
      <div className="edit_btnWrap">
        <button className="edit_btn" onClick={() => EditUserInfo()}>
          수정하기
        </button>
      </div>
    </div>
  );
}

export default Edit;
