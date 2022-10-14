//import * as loaderUtils from "../utils/vUtils_loader.js";
import Papa from "papaparse";

export default class DataManager {
  constructor() {
  }

  async loadAllData() {
    //await this.loadBeatTimeData();

    // await this.loadVolumesData([
    //   './assets/data/hm-volumes-1.txt',
    //   './assets/data/hm-volumes-2.txt',
    //   './assets/data/hm-volumes-3.txt',
    //   './assets/data/hm-volumes-4.txt',
    //   './assets/data/hm-volumes-5.txt'
    // ]);

    return 1;
  }

  // async loadBeatTimeData() {
  //   let data = await fetch("./assets/data/bonus-beats-msf-60fps.csv");
  //   let text = await data.text();
  //   let bars = Papa.parse(text).data;
    
  //   let firstSec = 0;
  //   for (let i = 0; i < bars.length; i++) {
  //     let tokens = bars[i][0].split(':');
  //     let sec = Number(tokens[0]) * 60 + Number(tokens[1]) + Number(tokens[2] / 60.0);
  //     if (i == 0) firstSec = sec;
  //     this.beatTimes.push(sec - firstSec);
  //   }
  //   return this.beatTimes;
  // }

  // async loadVolumesData(urls) {
  //   let res = await Promise.all(urls.map(el => fetch(el)))
  //   let resTexts = await Promise.all(res.map(e => e.text()))
  //   for (let i =0; i < resTexts.length; i++) {
  //     this.volumeList.push(new HVolumeTrack(Papa.parse(resTexts[i])));
  //     // console.log(resTexts[i]);
  //     //this.tracksList.push(new TrackData(json[i], Papa.parse(resTexts[i])));
  //   }

  //   return 1;
  // }
  
}
