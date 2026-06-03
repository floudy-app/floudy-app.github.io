import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import '../styles/home.css';

function Cloud() 
{
  return (
    <img src="/resources/svg/cloud.svg" className="home__cloud"/>
  );
}

function FolderBg() 
{
  return (
    <img src="/resources/svg/folder.svg" className='home__folder'/>
  );
}

export default function Home() 
{
  const nav = useNavigate();

  return (
    <div className="home page-in">
      <FolderBg />

      <div className="home__content">
        <div className="home__cloud-wrap">
          <Cloud />
          <span className="home__title grad-text">Floudy</span>
        </div>

        <p className="home__tagline-main grad-text">A quick small-scale cloud storage solution.</p>
        <p className="home__tagline-sub">Manage your own files as-is to easily transfer between devices.</p>
        <p className="home__or">*or your team's!</p>

        <button className="btn-grad home__cta" onClick={() => nav('/login')}>
          GO TO LOGIN
        </button>
      </div>
    </div>
  );
}
