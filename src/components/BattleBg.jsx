import React, { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

import bg1 from '../assets/bg/1.png'
import bg2 from '../assets/bg/2.png'
import bg3 from '../assets/bg/3.png'
import bg4 from '../assets/bg/4.png'
import bg5 from '../assets/bg/5.png'
import bg6 from '../assets/bg/6.png'
import bg7 from '../assets/bg/7.png'
import bg8 from '../assets/bg/8.png'

function BattleBg() {

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio("/audio/pixel-song.mp3"));
  audioRef.current.loop = true;
  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  return (
    <>
      <img src={bg1} className='bg-1' alt="bg-1" />
      <img src={bg2} className='bg-2' alt="bg-2" />
      <img src={bg3} className='bg-3' alt="bg-3" />
      <img src={bg4} className='bg-4' alt="bg-4" />
      <img src={bg5} className='bg-5' alt="bg-5" />
      <img src={bg6} className='bg-6' alt="bg-6" />
      <img src={bg7} className='bg-7' alt="bg-7" />
      <img src={bg8} className='bg-8' alt="bg-8" />

      <div className="">
      <button onClick={toggleAudio} className="audio-button">
        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </div>
    </>
  )
}

export default BattleBg