/* PLEASE DO NOT CHANGE THIS FRAMEWORK ....
the get requests are all implemented and working ... 
so there is no need to alter ANY of the existing code: 
rather you just ADD your own ... */

window.onload = function () {
  document.querySelector("#queryChoice").selectedIndex = 0;
  //create once :)
  let description = document.querySelector("#Ex4_title");
  //array to hold the dataPoints
  let dataPoints = [];

  // /**** GeT THE DATA initially :: default view *******/
  // /*** no need to change this one  **/
  runQueryDefault("onload");

  /***** Get the data from drop down selection ****/
  let querySelectDropDown = document.querySelector("#queryChoice");

  querySelectDropDown.onchange = function () {
    console.log(this.value);
    let copyVal = this.value;
    console.log(copyVal);
    runQuery(copyVal);
  };

  /******************* RUN QUERY***************************  */
  async function runQuery(queryPath) {
    // // //build the url -end point
    const url = `/${queryPath}`;
    try {
      let res = await fetch(url);
      let resJSON = await res.json();
      console.log(resJSON);

      //reset the
      document.querySelector("#childOne").innerHTML = "";
      description.textContent = "";
      document.querySelector("#parent-wrapper").style.background =
        "rgba(51,102,255,.2)";

      switch (queryPath) {
        case "three": {
          displayPositiveAfterMoodGrid(resJSON);
          break;
        }
        case "four": {
          displaySortedEventsTimeline(resJSON);
          break;
        }
        case "five": {
          displayMonTueStrengthBars(resJSON);
          break;
        }
        case "six": {
          displayDoubleNegativeWeatherColumns(resJSON);
          break;
        }

        /***** TO DO FOR EXERCISE 4 *************************
         ** 1: Once you have implemented the mongodb query in server.py,
         ** you will receive it from the get request (THE FETCH HAS ALREADY BEEN IMPLEMENTED:: SEE ABOVE) 
         ** and will automatically will enter into the correct select case
         **  - based on the value that the user chose from the drop down list...)
         ** You need to design and call a custom display function FOR EACH query that you construct ...
         ** 4 queries - I want 4 UNIQUE display functions - you can use the ones I created
         ** as inspiration ONLY - DO NOT just copy and change colors ... experiment, explore, change ...
         ** you can create your own custom objects - but NO images, video or sound... (will get 0).
         ** bonus: if your visualizations(s) are interactive or animate.
         ****/
        default: {
          console.log("default case");
          break;
        }
      } //switch
    } catch (err) {
      console.log(err);
    }
  }
  //will make a get request for the data ...

  /******************* RUN DEFAULT QUERY***************************  */
  async function runQueryDefault(queryPath) {
    // // //build the url -end point
    const url = `/${queryPath}`;
    try {
      let res = await fetch(url);
      let resJSON = await res.json();
      console.log(resJSON);
      displayAsDefault(resJSON);
    } catch (err) {
      console.log(err);
    }
  }
  /*******************DISPLAY AS GROUP****************************/

  function displayByGroups(resultObj, propOne, propTwo) {
    dataPoints = [];
    let finalHeight = 0;
    //order by WEATHER and Have the event names as the color  ....

    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(51, 153, 102,1)";
    description.textContent = "BY WEATHER AND ALSO HAVE EVENT NAMES {COLOR}";
    description.style.color = "rgb(179, 230, 204)";

    let coloredEvents = {};
    let resultSet = resultObj.results;

    //reget
    let possibleEvents = resultObj.events;
    let possibleColors = [
      "rgb(198, 236, 217)",
      "rgb(179, 230, 204)",
      "rgb(159, 223, 190)",
      "rgb(140, 217, 177)",
      "rgb(121, 210, 164)",
      "rgb(102, 204, 151)",
      "rgb(83, 198, 138)",
      "rgb(64, 191, 125)",
      "rgb(255, 204, 179)",
      "rgb(255, 170, 128)",
      "rgb(255, 153, 102)",
      "rgb(255, 136, 77)",
      "rgb(255, 119, 51)",
      "rgb(255, 102, 26)",
      "rgb(255, 85, 0)",
      "rgb(230, 77, 0)",
      "rgb(204, 68, 0)",
    ];

    for (let i = 0; i < possibleColors.length; i++) {
      coloredEvents[possibleEvents[i]] = possibleColors[i];
    }

    let offsetX = 20;
    let offsetY = 150;
    // find the weather of the first one ...
    let currentGroup = resultSet[0][propOne];
    console.log(currentGroup);
    let xPos = offsetX;
    let yPos = offsetY;

    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].event_name,
          //map to the EVENT ...
          coloredEvents[resultSet[i].event_name],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point_two"
        )
      );

      /** check if we have changed group ***/
      if (resultSet[i][propOne] !== currentGroup) {
        //update
        currentGroup = resultSet[i][propOne];
        offsetX += 150;
        offsetY = 150;
        xPos = offsetX;
        yPos = offsetY;
      }
      // if not just keep on....
      else {
        if (i % 10 === 0 && i !== 0) {
          xPos = offsetX;
          yPos = yPos + 15;
        } else {
          xPos = xPos + 15;
        }
      } //end outer else

      dataPoints[i].update(xPos, yPos);
      finalHeight = yPos;
    } //for

    document.querySelector("#childOne").style.height = `${finalHeight + 20}px`;
  } //function

  /*****************DISPLAY IN CIRCUlAR PATTERN:: <ONE>******************************/
  function displayInCirclularPattern(resultOBj) {
    //reset
    dataPoints = [];
    let xPos = 0;
    let yPos = 0;
    //for circle drawing
    let angle = 0;
    let centerX = window.innerWidth / 2;
    let centerY = 350;

    let scalar = 300;
    let yHeight = Math.cos(angle) * scalar + centerY;

    let resultSet = resultOBj.results;
    let coloredMoods = {};

    let possibleMoods = resultOBj.moods;
    let possibleColors = [
      "rgba(0, 64, 255,.5)",
      "rgba(26, 83, 255,.5)",
      "rgba(51, 102, 255,.7)",
      "rgba(51, 102, 255,.4)",
      "rgba(77, 121,255,.6)",
      "rgba(102, 140, 255,.6)",
      "rgba(128, 159, 255,.4)",
      "rgba(153, 179, 255,.3)",
      "rgba(179, 198, 255,.6)",
      "rgba(204, 217, 255,.4)",
    ];

    for (let i = 0; i < possibleMoods.length; i++) {
      coloredMoods[possibleMoods[i]] = possibleColors[i];
    }

    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(0, 26, 102,1)";
    description.textContent = "BY AFTER MOOD";
    description.style.color = "rgba(0, 64, 255,.5)";

    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].event_name,
          //map to the day ...
          coloredMoods[resultSet[i].after_mood],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point_two"
        )
      );
      /*** circle drawing ***/
      xPos = Math.sin(angle) * scalar + centerX;
      yPos = Math.cos(angle) * scalar + centerY;
      angle += 0.13;

      if (angle > 2 * Math.PI) {
        angle = 0;
        scalar -= 20;
      }
      dataPoints[i].update(xPos, yPos);
    } //for

    document.querySelector("#childOne").style.height = `${yHeight}px`;
  } //function

  /*****************DISPLAY AS DEFAULT GRID :: AT ONLOAD ******************************/
  function displayAsDefault(resultOBj) {
    //reset
    dataPoints = [];
    let xPos = 0;
    let yPos = 0;
    const NUM_COLS = 50;
    const CELL_SIZE = 20;
    let coloredDays = {};
    let resultSet = resultOBj.results;
    possibleDays = resultOBj.days;
    /*
  1: get the array of days (the second entry in the resultOBj)
  2: for each possible day (7)  - create a key value pair -> day: color and put in the
  coloredDays object
  */
    console.log(possibleDays);
    let possibleColors = [
      "rgb(255, 102, 153)",
      "rgb(255, 77, 136)",
      "rgb(255, 51, 119)",
      "rgb(255, 26, 102)",
      "rgb(255, 0, 85)",
      "rgb(255, 0, 85)",
      "rgb(255, 0, 85)",
    ];

    for (let i = 0; i < possibleDays.length; i++) {
      coloredDays[possibleDays[i]] = possibleColors[i];
    }
/* for through each result
1: create a new MyDataPoint object and pass the properties from the db result entry to the object constructor
2: set the color using the coloredDays object associated with the resultSet[i].day
3:  put into the dataPoints array.
**/
    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(255,0,0,.4)";
    description.textContent = "DEfAULT CASE";
    description.style.color = "rgb(255, 0, 85)";

    //last  element is the helper array...
    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].evnet_name,
          //map to the day ...
          coloredDays[resultSet[i].day],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point"
        )
      );

      /** this code is rather brittle - but does the job for now .. draw a grid of data points ..
//*** drawing a grid ****/
      if (i % NUM_COLS === 0) {
        //reset x and inc y (go to next row)
        xPos = 0;
        yPos += CELL_SIZE;
      } else {
        //just move along in the column
        xPos += CELL_SIZE;
      }
      //update the position of the data point...
      dataPoints[i].update(xPos, yPos);
    } //for
    document.querySelector("#childOne").style.height = `${yPos + CELL_SIZE}px`;
  } //function

  
/* THREE — dynamic clusters (with repulsion, no collapse) */
function displayPositiveAfterMoodGrid(resultObj){
  dataPoints = [];
  document.querySelector("#childOne").innerHTML = "";

  const parent = document.querySelector("#childOne");
  const resultSet = resultObj.results;

  description.textContent = "AFTER MOOD = POSITIVE (dynamic clusters)";
  document.querySelector("#parent-wrapper").style.background = "rgba(0,200,150,.05)";

  const pos = ["happy","neutral","calm","serene","well"];

  const moodColors = {
    happy:  "rgba(255,170,0,0.8)",
    neutral:"rgba(0,160,255,0.8)",
    calm:   "rgba(0,200,150,0.8)",
    serene: "rgba(180,120,255,0.8)",
    well:   "rgba(60,60,60,0.85)"
  };

  const wrapper = document.querySelector("#parent-wrapper");
  const W = wrapper.clientWidth;
  const H = wrapper.clientHeight;

  const centers = {};
  for(let k=0;k<pos.length;k++){
    centers[pos[k]] = {
      x: (k+0.5)*(W/pos.length),
      y: H*0.55
    };

    const label = document.createElement("div");
    label.textContent = pos[k].toUpperCase();
    label.style.position = "absolute";
    label.style.left = (centers[pos[k]].x - 25) + "px";
    label.style.top = "50px";
    label.style.fontSize = "12px";
    label.style.opacity = "0.85";
    parent.appendChild(label);
  }

  const filtered = resultSet.filter(d => pos.includes(d.after_mood));
  const particles = [];

  for(let i=0;i<filtered.length;i++){
    const m = filtered[i].after_mood;

    const p = new myDataPoint(
      filtered[i].dataId,
      filtered[i].day,
      filtered[i].weather,
      filtered[i].start_mood,
      filtered[i].after_mood,
      filtered[i].after_mood_strength,
      filtered[i].event_affect_strength,
      filtered[i].event_name,
      moodColors[m],
      parent,
      "dataPointSmall"
    );

    const startX = Math.random()*W;
    const startY = Math.random()*H;

    particles.push({
      dp: p,
      mood: m,
      x: startX,
      y: startY,
      vx: (Math.random()-0.5)*2,
      vy: (Math.random()-0.5)*2,
      jitterPhase: Math.random()*Math.PI*2
    });

    dataPoints.push(p);
    p.update(startX, startY);
  }

  let t = 0;
  function animate(){
    t += 0.015;

    for(let i=0;i<particles.length;i++){
      const pt = particles[i];
      const c = centers[pt.mood];

      let ax = (c.x - pt.x) * 0.0045;
      let ay = (c.y - pt.y) * 0.0045;

      let rx = 0;
      let ry = 0;
      for(let j=0;j<particles.length;j++){
        if(i === j) continue;
        const other = particles[j];
        if(other.mood !== pt.mood) continue;

        const dx = pt.x - other.x;
        const dy = pt.y - other.y;
        const d2 = dx*dx + dy*dy;
        const minD = 18;

        if(d2 > 0 && d2 < minD*minD){
          const d = Math.sqrt(d2);
          const push = (minD - d) / minD;
          rx += (dx / d) * push * 0.35;
          ry += (dy / d) * push * 0.35;
        }
      }

      ax += rx;
      ay += ry;

      pt.vx += ax;
      pt.vy += ay;

      pt.vx *= 0.88;
      pt.vy *= 0.88;

      pt.jitterPhase += 0.03;
      pt.vx += Math.cos(pt.jitterPhase + i) * 0.03;
      pt.vy += Math.sin(pt.jitterPhase + i) * 0.03;

      pt.x += pt.vx;
      pt.y += pt.vy;

      pt.dp.update(pt.x, pt.y);
    }

    requestAnimationFrame(animate);
  }
  animate();
}


 /* FOUR — sorted events, bigger dots + bigger labels + slide-in */
function displaySortedEventsTimeline(resultObj){
  dataPoints = [];
  document.querySelector("#childOne").innerHTML = "";

  const parent = document.querySelector("#childOne");
  const resultSet = resultObj.results;

  description.textContent = "ALL ENTRIES SORTED BY EVENT (timeline stripes)";
  document.querySelector("#parent-wrapper").style.background = "rgba(255,170,0,.05)";

  let currentEvent = null;
  let bandY = 70;      
  let xTarget = 60;    
  const xStep = 12;   

  const particles = [];

  for(let i=0;i<resultSet.length;i++){
    const ev = resultSet[i].event_name;

    if(ev !== currentEvent){
      currentEvent = ev;
      bandY += 36;    
      xTarget = 60;

      const label = document.createElement("div");
      label.textContent = ev;
      label.style.position = "absolute";
      label.style.left = "60px";
      label.style.top = (bandY - 22) + "px";
      label.style.fontSize = "14px";    
      label.style.fontWeight = "600";
      label.style.opacity = "0.8";
      parent.appendChild(label);
    }

    const p = new myDataPoint(
      resultSet[i].dataId,
      resultSet[i].day,
      resultSet[i].weather,
      resultSet[i].start_mood,
      resultSet[i].after_mood,
      resultSet[i].after_mood_strength,
      resultSet[i].event_affect_strength,
      resultSet[i].event_name,
      "rgba(255,140,0,.75)", 
      parent,
      "dataPointSmall"      
    );

    const startX = 0;         
    const startY = bandY;
    const targetX = xTarget;
    const targetY = bandY;

    dataPoints.push(p);
    p.update(startX, startY);

    particles.push({
      dp: p,
      x: startX,
      y: startY,
      tx: targetX,
      ty: targetY
    });

    xTarget += xStep;
  }

  function animate(){
    for(let i=0;i<particles.length;i++){
      const pt = particles[i];
      pt.x += (pt.tx - pt.x) * 0.05;  
      pt.y += (pt.ty - pt.y) * 0.09;
      pt.dp.update(pt.x, pt.y);
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* FIVE — mon/tue scaled bars + dynamic grow */
function displayMonTueStrengthBars(resultObj){
  dataPoints = [];
  document.querySelector("#childOne").innerHTML = "";

  const parent = document.querySelector("#childOne");
  const resultSet = resultObj.results;

  description.textContent = "MON/TUE BY EVENT AFFECT STRENGTH";
  document.querySelector("#parent-wrapper").style.background = "rgba(80,80,255,.05)";

  const strengths = [1,2,3,4,5,6,7,8,9,10];
  let groups = {};
  strengths.forEach(s => groups[s] = []);

  for(let i=0;i<resultSet.length;i++){
    const s = parseInt(resultSet[i].event_affect_strength);
    if(groups[s]) groups[s].push(resultSet[i]);
  }

  const maxCount = Math.max(...strengths.map(s => groups[s].length));

  const leftPad = 120;
  const colGap = 70;
  const baseY = 430;
  const gapY = 9;
  const cloudW = 32;

  const particles = [];

  for(let k=0;k<strengths.length;k++){
    const s = strengths[k];
    const arr = groups[s];
    const count = arr.length;

    const ratio = maxCount === 0 ? 0 : count / maxCount;
    const sizeScale = 1.0 + ratio * 1.8;
    const dotClass = (sizeScale > 1.9 ? "dataPointSmall" : "dataPointTiny");

    const label = document.createElement("div");
    label.textContent = s;
    label.style.position = "absolute";
    label.style.left = (leftPad + k*colGap - 4) + "px";
    label.style.top = (baseY + 18) + "px";
    label.style.fontSize = "13px";
    label.style.opacity = "0.8";
    parent.appendChild(label);

    const cx = leftPad + k*colGap;

    for(let i=0;i<arr.length;i++){
      const E = arr[i];

      const jitterX = (Math.random()-0.5) * cloudW;
      const targetX = cx + jitterX;
      const targetY = baseY - i*gapY;

      const p = new myDataPoint(
        E.dataId,
        E.day,
        E.weather,
        E.start_mood,
        E.after_mood,
        E.after_mood_strength,
        E.event_affect_strength,
        E.event_name,
        "rgba(80,80,255,0.9)",
        parent,
        dotClass
      );

      const startX = targetX;
      const startY = baseY;

      dataPoints.push(p);
      p.update(startX, startY);

      particles.push({
        dp: p,
        x: startX,
        y: startY,
        tx: targetX,
        ty: targetY
      });
    }
  }

  function animate(){
    for(let i=0;i<particles.length;i++){
      const pt = particles[i];
      pt.y += (pt.ty - pt.y) * 0.14;
      pt.dp.update(pt.x, pt.y);
    }
    requestAnimationFrame(animate);
  }
  animate();
}


  // ====== SIX: start & after both negative, sorted by weather ======
function displayDoubleNegativeWeatherColumns(resultObj){
  dataPoints = [];
  document.querySelector("#childOne").innerHTML = "";

  const parent = document.querySelector("#childOne");
  const resultSet = resultObj.results;
  const weathers = resultObj.weather;

  description.textContent = "WEATHER";
  document.querySelector("#parent-wrapper").style.background = "rgba(0,0,0,.04)";

  const wrapper = document.querySelector("#parent-wrapper");
  const W = wrapper.clientWidth || 900;

  const leftPad = 60;
  const rightPad = 60;
  const usableW = W - leftPad - rightPad;
  const tubeGap = usableW / weathers.length;

  const topPad = 95;
  const baseY = 420;
  const radius = 7;
  const gapY = 5;

  let counts = {};
  weathers.forEach(w => counts[w] = 0);

  const particles = [];

  for(let k=0;k<weathers.length;k++){
    const w = weathers[k];
    const cx = leftPad + k*tubeGap + tubeGap/2;

    const label = document.createElement("div");
    label.textContent = w;
    label.style.position="absolute";
    label.style.left=(cx - 18) + "px";
    label.style.top=(topPad - 55) + "px";
    label.style.fontSize="12px";
    label.style.opacity="0.85";
    label.style.whiteSpace="nowrap";
    parent.appendChild(label);

    const tubeLine = document.createElement("div");
    tubeLine.style.position="absolute";
    tubeLine.style.left=(cx) + "px";
    tubeLine.style.top=(topPad - 8) + "px";
    tubeLine.style.width="2px";
    tubeLine.style.height="300px";
    tubeLine.style.background="rgba(0,0,0,0.08)";
    tubeLine.style.borderRadius="2px";
    parent.appendChild(tubeLine);
  }

  for(let i=0;i<resultSet.length;i++){
    const w = resultSet[i].weather;
    const col = weathers.indexOf(w);
    if(col < 0) continue;

    const cx = leftPad + col*tubeGap + tubeGap/2;
    const y0 = topPad + counts[w]*gapY;
    counts[w]++;

    const p = new myDataPoint(
      resultSet[i].dataId,
      resultSet[i].day,
      resultSet[i].weather,
      resultSet[i].start_mood,
      resultSet[i].after_mood,
      resultSet[i].after_mood_strength,
      resultSet[i].event_affect_strength,
      resultSet[i].event_name,
      "rgba(40,40,40,.8)",
      parent,
      "dataPointSmall"
    );

    const phase = Math.random()*Math.PI*2;
    dataPoints.push(p);
    p.update(cx, y0);

    particles.push({
      dp: p,
      cx: cx,
      y: y0,
      phase: phase,
      speed: 0.02 + Math.random()*0.015
    });
  }

  function animate(){
    for(let i=0;i<particles.length;i++){
      const pt = particles[i];
      pt.phase += pt.speed;

      const x = pt.cx + Math.cos(pt.phase)*radius;
      const y = pt.y + Math.sin(pt.phase)*2;

      pt.dp.update(x, y);

      const scale = 0.75 + (Math.sin(pt.phase)+1)*0.22;
      pt.dp.container.style.transform = `translate(-50%,-50%) scale(${scale})`;
      pt.dp.container.style.opacity = 0.55 + (Math.cos(pt.phase)+1)*0.22;
    }
    requestAnimationFrame(animate);
  }
  animate();
}


/***********************************************/
};


