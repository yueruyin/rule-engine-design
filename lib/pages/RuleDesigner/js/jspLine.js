/* eslint-disable */
export default {
  jspLine, pointOnPath
}

function jspLine(params) {
  return compute(prepareCompute(params));
}

let paramsinfo = {
  targetPos: [780, 120],
  targetDirection: 'Bottom',
  targetOrientation: [0, -1],
  // targetInfo: {
  //     "left": 740,
  //     "top": 120,
  //     "right": 820,
  //     "bottom": 200,
  //     "width": 80,
  //     "height": 80,
  //     "centerx": 780,
  //     "centery": 160
  // },
  sourcePos: [494, 168],
  sourceDirection: 'Top',
  // sourceInfo: {
  //     "left": 454,
  //     "top": 88,
  //     "right": 534,
  //     "bottom": 168,
  //     "width": 80,
  //     "height": 80,
  //     "centerx": 494,
  //     "centery": 128
  // },
  sourceOrientation: [0, 1]
}
let root = this;
let Biltong = {
  version: '0.4.0'
};

function pointOnPath(location, absolute) {
  let seg = _findSegmentForLocation(location, absolute);
  let coordinate = seg.segment && seg.segment.pointOnPath(seg.proportion, false) || [0, 0];
  return { x: coordinate.x + qx, y: coordinate.y + qy };
};


function prepareCompute(params) {
  paramsinfo = params;
  segments = [];
  totalLength = 0;
  segmentProportionalLengths = [];
  segmentProportions = [];
  dbo = [];
  params.targetPos = [params.targetPos[0], params.targetPos[1], curryAnchor[params.sourceDirection][0], curryAnchor[params.sourceDirection][1]]
  params.sourcePos = [params.sourcePos[0], params.sourcePos[1], curryAnchor[params.targetDirection][0], curryAnchor[params.targetDirection][1]]
  // this.strokeWidth = params.strokeWidth;
  let segment = quadrant(params.sourcePos, params.targetPos);
  let swapX = params.targetPos[0] < params.sourcePos[0];
  let swapY = params.targetPos[1] < params.sourcePos[1];
  let lw = params.strokeWidth || 1;
  let so = [curryAnchor[params.sourceDirection][2], curryAnchor[params.sourceDirection][3]];
  let to = [curryAnchor[params.targetDirection][2], curryAnchor[params.targetDirection][3]];
  let x = swapX ? params.targetPos[0] : params.sourcePos[0];
  let y = swapY ? params.targetPos[1] : params.sourcePos[1];
  let w = Math.abs(params.targetPos[0] - params.sourcePos[0]);
  let h = Math.abs(params.targetPos[1] - params.sourcePos[1]);
  qx = x;
  qy = y;
  // if either anchor does not have an orientation set, we derive one from their relative
  // positions.  we fix the axis to be the one in which the two elements are further apart, and
  // point each anchor at the other element.  this is also used when dragging a new connection.
  if (so[0] === 0 && so[1] === 0 || to[0] === 0 && to[1] === 0) {
    let index = w > h ? 0 : 1;
    let oIndex = [1, 0][index];
    so = [];
    to = [];
    so[index] = params.sourcePos[index] > params.targetPos[index] ? -1 : 1;
    to[index] = params.sourcePos[index] > params.targetPos[index] ? 1 : -1;
    so[oIndex] = 0;
    to[oIndex] = 0;
  }

  let sx = swapX ? w + (sourceGap * so[0]) : sourceGap * so[0];
  let sy = swapY ? h + (sourceGap * so[1]) : sourceGap * so[1];
  let tx = swapX ? targetGap * to[0] : w + (targetGap * to[0]);
  let ty = swapY ? targetGap * to[1] : h + (targetGap * to[1]);
  let oProduct = ((so[0] * to[0]) + (so[1] * to[1]));

  let result = {
    sx: sx,
    sy: sy,
    tx: tx,
    ty: ty,
    lw: lw,
    xSpan: Math.abs(tx - sx),
    ySpan: Math.abs(ty - sy),
    mx: (sx + tx) / 2,
    my: (sy + ty) / 2,
    so: so,
    to: to,
    x: x,
    y: y,
    w: w,
    h: h,
    segment: segment,
    startStubX: sx + (so[0] * sourceStub),
    startStubY: sy + (so[1] * sourceStub),
    endStubX: tx + (to[0] * targetStub),
    endStubY: ty + (to[1] * targetStub),
    isXGreaterThanStubTimes2: Math.abs(sx - tx) > (sourceStub + targetStub),
    isYGreaterThanStubTimes2: Math.abs(sy - ty) > (sourceStub + targetStub),
    opposite: oProduct === -1,
    perpendicular: oProduct === 0,
    orthogonal: oProduct === 1,
    sourceAxis: so[0] === 0 ? 'y' : 'x',
    points: [x, y, w, h, sx, sy, tx, ty],
    stubs: [sourceStub, targetStub]
  };
  result.anchorOrientation = result.opposite ? 'opposite' : result.orthogonal ? 'orthogonal' : 'perpendicular';
  return result;
};

function compute(paintInfo) {
  segments = [];
  lastx = null;
  lasty = null;
  lastOrientation = null;

  let commonStubCalculator = function () {
    return [paintInfo.startStubX, paintInfo.startStubY, paintInfo.endStubX, paintInfo.endStubY];
  };
  let stubCalculators = {
    perpendicular: commonStubCalculator,
    orthogonal: commonStubCalculator,
    opposite: function (axis) {
      let pi = paintInfo;
      let idx = axis === 'x' ? 0 : 1;
      let areInProximity = {
        'x': function () {
          return ((pi.so[idx] === 1 && (
            ((pi.startStubX > pi.endStubX) && (pi.tx > pi.startStubX)) ||
                  ((pi.sx > pi.endStubX) && (pi.tx > pi.sx))))) ||

                ((pi.so[idx] === -1 && (
                  ((pi.startStubX < pi.endStubX) && (pi.tx < pi.startStubX)) ||
                  ((pi.sx < pi.endStubX) && (pi.tx < pi.sx)))));
        },
        'y': function () {
          return ((pi.so[idx] === 1 && (
            ((pi.startStubY > pi.endStubY) && (pi.ty > pi.startStubY)) ||
                  ((pi.sy > pi.endStubY) && (pi.ty > pi.sy))))) ||

                ((pi.so[idx] === -1 && (
                  ((pi.startStubY < pi.endStubY) && (pi.ty < pi.startStubY)) ||
                  ((pi.sy < pi.endStubY) && (pi.ty < pi.sy)))));
        }
      };

      if (areInProximity[axis]()) {
        return {
          'x': [(paintInfo.sx + paintInfo.tx) / 2, paintInfo.startStubY, (paintInfo.sx + paintInfo.tx) / 2, paintInfo.endStubY],
          'y': [paintInfo.startStubX, (paintInfo.sy + paintInfo.ty) / 2, paintInfo.endStubX, (paintInfo.sy + paintInfo.ty) / 2]
        }[axis];
      } else {
        return [paintInfo.startStubX, paintInfo.startStubY, paintInfo.endStubX, paintInfo.endStubY];
      }
    }
  };

  // calculate Stubs.
  let stubs = stubCalculators[paintInfo.anchorOrientation](paintInfo.sourceAxis);
  let idx = paintInfo.sourceAxis === 'x' ? 0 : 1;
  let oidx = paintInfo.sourceAxis === 'x' ? 1 : 0;
  let ss = stubs[idx];
  let oss = stubs[oidx];
  let es = stubs[idx + 2];
  let oes = stubs[oidx + 2];

  // add the start stub segment. use stubs for loopback as it will look better, with the loop spaced
  // away from the element.
  addSegment(segments, stubs[0], stubs[1], paintInfo);

  // if its a loopback and we should treat it differently.
  // if (false && params.sourcePos[0] === params.targetPos[0] && params.sourcePos[1] === params.targetPos[1]) {
  //
  //     // we use loopbackRadius here, as statemachine connectors do.
  //     // so we go radius to the left from stubs[0], then upwards by 2*radius, to the right by 2*radius,
  //     // down by 2*radius, left by radius.
  //     addSegment(segments, stubs[0] - loopbackRadius, stubs[1], paintInfo);
  //     addSegment(segments, stubs[0] - loopbackRadius, stubs[1] - (2 * loopbackRadius), paintInfo);
  //     addSegment(segments, stubs[0] + loopbackRadius, stubs[1] - (2 * loopbackRadius), paintInfo);
  //     addSegment(segments, stubs[0] + loopbackRadius, stubs[1], paintInfo);
  //     addSegment(segments, stubs[0], stubs[1], paintInfo);
  //
  // }
  // else {



  let midx = paintInfo.startStubX + ((paintInfo.endStubX - paintInfo.startStubX) * midpoint);
  let midy = paintInfo.startStubY + ((paintInfo.endStubY - paintInfo.startStubY) * midpoint);

  let orientations = {
    x: [0, 1],
    y: [1, 0]
  };
  let lineCalculators = {
    perpendicular: function (axis) {
      let pi = paintInfo;
      let sis = {
        x: [
          [
            [1, 2, 3, 4], null, [2, 1, 4, 3]
          ],
          null,
          [
            [4, 3, 2, 1], null, [3, 4, 1, 2]
          ]
        ],
        y: [
          [
            [3, 2, 1, 4], null, [2, 3, 4, 1]
          ],
          null,
          [
            [4, 1, 2, 3], null, [1, 4, 3, 2]
          ]
        ]
      };
      let stubs = {
        x: [
          [pi.startStubX, pi.endStubX], null, [pi.endStubX, pi.startStubX]
        ],
        y: [
          [pi.startStubY, pi.endStubY], null, [pi.endStubY, pi.startStubY]
        ]
      };
      let midLines = {
        x: [
          [midx, pi.startStubY],
          [midx, pi.endStubY]
        ],
        y: [
          [pi.startStubX, midy],
          [pi.endStubX, midy]
        ]
      };
      let linesToEnd = {
        x: [
          [pi.endStubX, pi.startStubY]
        ],
        y: [
          [pi.startStubX, pi.endStubY]
        ]
      };
      let startToEnd = {
        x: [
          [pi.startStubX, pi.endStubY],
          [pi.endStubX, pi.endStubY]
        ],
        y: [
          [pi.endStubX, pi.startStubY],
          [pi.endStubX, pi.endStubY]
        ]
      };
      let startToMidToEnd = {
        x: [
          [pi.startStubX, midy],
          [pi.endStubX, midy],
          [pi.endStubX, pi.endStubY]
        ],
        y: [
          [midx, pi.startStubY],
          [midx, pi.endStubY],
          [pi.endStubX, pi.endStubY]
        ]
      };
      let otherStubs = {
        x: [pi.startStubY, pi.endStubY],
        y: [pi.startStubX, pi.endStubX]
      };
      let soIdx = orientations[axis][0];
      let toIdx = orientations[axis][1];
      let _so = pi.so[soIdx] + 1;
      let _to = pi.to[toIdx] + 1;
      let otherFlipped = (pi.to[toIdx] === -1 && (otherStubs[axis][1] < otherStubs[axis][0])) || (pi.to[toIdx] === 1 && (otherStubs[axis][1] > otherStubs[axis][0]));
      let stub1 = stubs[axis][_so][0];
      let stub2 = stubs[axis][_so][1];
      let segmentIndexes = sis[axis][_so][_to];

      if (pi.segment === segmentIndexes[3] || (pi.segment === segmentIndexes[2] && otherFlipped)) {
        return midLines[axis];
      } else if (pi.segment === segmentIndexes[2] && stub2 < stub1) {
        return linesToEnd[axis];
      } else if ((pi.segment === segmentIndexes[2] && stub2 >= stub1) || (pi.segment === segmentIndexes[1] && !otherFlipped)) {
        return startToMidToEnd[axis];
      } else if (pi.segment === segmentIndexes[0] || (pi.segment === segmentIndexes[1] && otherFlipped)) {
        return startToEnd[axis];
      }
    },
    orthogonal: function (axis, startStub, otherStartStub, endStub, otherEndStub) {
      let pi = paintInfo;
      let extent = {
        'x': pi.so[0] === -1 ? Math.min(startStub, endStub) : Math.max(startStub, endStub),
        'y': pi.so[1] === -1 ? Math.min(startStub, endStub) : Math.max(startStub, endStub)
      }[axis];

      return {
        'x': [
          [extent, otherStartStub],
          [extent, otherEndStub],
          [endStub, otherEndStub]
        ],
        'y': [
          [otherStartStub, extent],
          [otherEndStub, extent],
          [otherEndStub, endStub]
        ]
      }[axis];
    },
    opposite: function (axis, ss, oss, es) {
      let pi = paintInfo;
      let otherAxis = {
        'x': 'y',
        'y': 'x'
      }[axis];
      let dim = {
        'x': 'height',
        'y': 'width'
      }[axis];
      let comparator = pi['is' + axis.toUpperCase() + 'GreaterThanStubTimes2'];

      if (false) {
        let _val = oss + ((1 - params.sourceEndpoint.anchor[otherAxis]) * params.sourceInfo[dim]) + _super.maxStub;
        return {
          'x': [
            [ss, _val],
            [es, _val]
          ],
          'y': [
            [_val, ss],
            [_val, es]
          ]
        }[axis];
      } else if (!comparator || (pi.so[idx] === 1 && ss > es) || (pi.so[idx] === -1 && ss < es)) {
        return {
          'x': [
            [ss, midy],
            [es, midy]
          ],
          'y': [
            [midx, ss],
            [midx, es]
          ]
        }[axis];
      } else if ((pi.so[idx] === 1 && ss < es) || (pi.so[idx] === -1 && ss > es)) {
        return {
          'x': [
            [midx, pi.sy],
            [midx, pi.ty]
          ],
          'y': [
            [pi.sx, midy],
            [pi.tx, midy]
          ]
        }[axis];
      }
    }
  };

  // compute the rest of the line
  let p = lineCalculators[paintInfo.anchorOrientation](paintInfo.sourceAxis, ss, oss, es, oes);
  if (p) {
    for (let i = 0; i < p.length; i++) {
      addSegment(segments, p[i][0], p[i][1], paintInfo);
    }
  }

  // line to end stub
  addSegment(segments, stubs[2], stubs[3], paintInfo);

  // }

  // end stub to end (common)
  addSegment(segments, paintInfo.tx, paintInfo.ty, paintInfo);



  // write out the segments.
  writeSegments(this, segments, paintInfo);

  // let size = dbo.length - 1;
  // for (let i = size; i > -1; i--) {
  //     dbo.push({
  //         x1: dbo[i].x1+1,
  //         y1: dbo[i].y1+1,
  //         x2: dbo[i].x2+1,
  //         y2: dbo[i].y2+1
  //     });
  // }
  _updateSegmentProportions();
  return getPathData(dbo);
};

var curryAnchor = {
  'TopCenter': [0.5, 0, 0, -1],
  'BottomCenter': [0.5, 1, 0, 1],
  'LeftMiddle': [0, 0.5, -1, 0],
  'RightMiddle': [1, 0.5, 1, 0],
  'Top': [0.5, 0, 0, -1],
  'Bottom': [0.5, 1, 0, 1],
  'Left': [0, 0.5, -1, 0],
  'Right': [1, 0.5, 1, 0],
  'Center': [0.5, 0.5, 0, 0],
  'TopRight': [1, 0, 0, -1],
  'BottomRight': [1, 1, 0, 1],
  'TopLeft': [0, 0, 0, -1],
  'BottomLeft': [0, 1, 0, 1]
};

// (specimen.length >= 4) ? [ specimen[2], specimen[3] ] : [0, 0]
// 值
// _curryAnchor(0.5, 0, 0, -1, "TopCenter"); //上中
// _curryAnchor(0.5, 1, 0, 1, "BottomCenter"); //下中
// _curryAnchor(0, 0.5, -1, 0, "LeftMiddle"); //左中
// _curryAnchor(1, 0.5, 1, 0, "RightMiddle"); //右中

// _curryAnchor(0.5, 0, 0, -1, "Top"); //上中
// _curryAnchor(0.5, 1, 0, 1, "Bottom"); //下中
// _curryAnchor(0, 0.5, -1, 0, "Left"); //左中
// _curryAnchor(1, 0.5, 1, 0, "Right"); //右中
// _curryAnchor(0.5, 0.5, 0, 0, "Center"); //中心
// _curryAnchor(1, 0, 0, -1, "TopRight"); //上右
// _curryAnchor(1, 1, 0, 1, "BottomRight"); //下右
// _curryAnchor(0, 0, 0, -1, "TopLeft"); //上左
// _curryAnchor(0, 1, 0, 1, "BottomLeft"); //下左
var dbo = [];
var totalLength = 0;
var segments = [];
var segmentProportions = [];
var segmentProportionalLengths = [];
var midpoint = 0.5;
var sourceGap = 0;
var targetGap = 0;
var sourceStub = 30;
var targetStub = 30;
let cornerRadius = 5;
let STRAIGHT = 'Straight';
let ARC = 'Arc';
let lastx;
let lasty;
var qx = 0;
var qy = 0;
let lastOrientation;
var addSegment = function (segments, x, y, paintInfo) {
  if (lastx === x && lasty === y) {
    return;
  }
  let lx = lastx == null ? paintInfo.sx : lastx;
  let ly = lasty == null ? paintInfo.sy : lasty;
  let o = lx === x ? 'v' : 'h';

  lastx = x;
  lasty = y;
  segments.push([lx, ly, x, y, o]);
};
var _updateSegmentProportions = function () {
  let curLoc = 0;
  for (let i = 0; i < dbo.length; i++) {
    let sl = dbo[i].getLength();
    segmentProportionalLengths[i] = sl / totalLength;
    segmentProportions[i] = [curLoc, (curLoc += (sl / totalLength))];
  }
};
let segLength = function (s) {
  return Math.sqrt(Math.pow(s[0] - s[2], 2) + Math.pow(s[1] - s[3], 2));
};
let sgn = function (n) {
  return n < 0 ? -1 : n === 0 ? 0 : 1;
};
let segmentDirections = function (segment) {
  return [
    sgn(segment[2] - segment[0]),
    sgn(segment[3] - segment[1])
  ];
};
let getPath = function (segment, isFirstSegment) {
  return ({
    'Straight': function (isFirstSegment) {
      let d = segment.getCoordinates();
      return (isFirstSegment ? 'M ' + (d.x1 + qx) + ' ' + (d.y1 + qy) + ' ' : '') + 'L ' + (d.x2 + qx) + ' ' + (d.y2 + qy);
    },
    'Bezier': function (isFirstSegment) {
      let d = segment.params;
      return (isFirstSegment ? 'M ' + d.x2 + ' ' + d.y2 + ' ' : '') +
          'C ' + d.cp2x + ' ' + d.cp2y + ' ' + d.cp1x + ' ' + d.cp1y + ' ' + (d.x1 + qx) + ' ' + (d.y1 + qy);
    },
    'Arc': function (isFirstSegment) {
      let d = segment.params;
      let laf = segment.sweep > Math.PI ? 1 : 0;
      let sf = segment.anticlockwise ? 0 : 1;

      return (isFirstSegment ? 'M' + (segment.x1 + qx) + ' ' + (segment.y1 + qy) + ' ' : '') + 'A ' + segment.radius + ' ' + d.r + ' 0 ' + laf + ',' + sf + ' ' + (segment.x2 + qx) + ' ' + (segment.y2 + qy);
    }
  })[segment.type](isFirstSegment);
};
let _cloneArray = function (a) {
  let _a = [];
  _a.push.apply(_a, a);
  return _a;
};
var quadrant = function (p1, p2) {
  return _pointHelper(p1, p2, function (_p1, _p2) {
    if (_p2[0] > _p1[0]) {
      return (_p2[1] > _p1[1]) ? 2 : 1;
    } else if (_p2[0] == _p1[0]) {
      return _p2[1] > _p1[1] ? 2 : 1;
    } else {
      return (_p2[1] > _p1[1]) ? 3 : 4;
    }
  });
};
var writeSegments = function (conn, segments, paintInfo) {
  let current = null;
  let next; let currentDirection; let nextDirection;
  for (let i = 0; i < segments.length - 1; i++) {
    current = current || _cloneArray(segments[i]);
    next = _cloneArray(segments[i + 1]);

    currentDirection = segmentDirections(current);
    nextDirection = segmentDirections(next);

    if (cornerRadius > 0 && current[4] !== next[4]) {
      let minSegLength = Math.min(segLength(current), segLength(next));
      let radiusToUse = Math.min(cornerRadius, minSegLength / 2);

      current[2] -= currentDirection[0] * radiusToUse;
      current[3] -= currentDirection[1] * radiusToUse;
      next[0] += nextDirection[0] * radiusToUse;
      next[1] += nextDirection[1] * radiusToUse;

      let ac = (currentDirection[1] === nextDirection[0] && nextDirection[0] === 1) ||
          ((currentDirection[1] === nextDirection[0] && nextDirection[0] === 0) && currentDirection[0] !== nextDirection[1]) ||
          (currentDirection[1] === nextDirection[0] && nextDirection[0] === -1);
      let sgny = next[1] > current[3] ? 1 : -1;
      let sgnx = next[0] > current[2] ? 1 : -1;
      let sgnEqual = sgny === sgnx;
      let cx = (sgnEqual && ac || (!sgnEqual && !ac)) ? next[0] : current[2];
      let cy = (sgnEqual && ac || (!sgnEqual && !ac)) ? current[3] : next[1];

      _addSegmentConn(conn, STRAIGHT, {
        x1: current[0],
        y1: current[1],
        x2: current[2],
        y2: current[3]
      });

      _addSegmentConn(conn, ARC, {
        r: radiusToUse,
        x1: current[2],
        y1: current[3],
        x2: next[0],
        y2: next[1],
        cx: cx,
        cy: cy,
        ac: ac
      });
    } else {
      // dx + dy are used to adjust for line width.
      let dx = (current[2] === current[0]) ? 0 : (current[2] > current[0]) ? (paintInfo.lw / 2) : -(paintInfo.lw / 2);
      let dy = (current[3] === current[1]) ? 0 : (current[3] > current[1]) ? (paintInfo.lw / 2) : -(paintInfo.lw / 2);

      _addSegmentConn(conn, STRAIGHT, {
        x1: current[0] - dx,
        y1: current[1] - dy,
        x2: current[2] + dx,
        y2: current[3] + dy
      });
    }
    current = next;
  }
  if (next != null) {
    // last segment
    _addSegmentConn(conn, STRAIGHT, {
      x1: next[0],
      y1: next[1],
      x2: next[2],
      y2: next[3]
    });
  }
};
let _isa = function (a) {
  return Object.prototype.toString.call(a) === '[object Array]';
};
var _pointHelper = function (p1, p2, fn) {
  p1 = _isa(p1) ? p1 : [p1.x, p1.y];
  p2 = _isa(p2) ? p2 : [p2.x, p2.y];
  return fn(p1, p2);
};
var _findSegmentForLocation = function (location, absolute) {
  let idx, i, inSegmentProportion;

  if (absolute) {
    location = location > 0 ? location / totalLength : (totalLength + location) / totalLength;
  }

  // if location 1 we know its the last segment
  if (location === 1) {
    idx = segments.length - 1;
    inSegmentProportion = 1;
  } else if (location === 0) {
    // if location 0 we know its the first segment
    inSegmentProportion = 0;
    idx = 0;
  } else {
    // if location >= 0.5, traverse backwards (of course not exact, who knows the segment proportions. but
    // an educated guess at least)
    if (location >= 0.5) {
      idx = 0;
      inSegmentProportion = 0;
      for (i = segmentProportions.length - 1; i > -1; i--) {
        if (segmentProportions[i][1] >= location && segmentProportions[i][0] <= location) {
          idx = i;
          inSegmentProportion = (location - segmentProportions[i][0]) / segmentProportionalLengths[i];
          break;
        }
      }
    } else {
      idx = segmentProportions.length - 1;
      inSegmentProportion = 1;
      for (i = 0; i < segmentProportions.length; i++) {
        if (segmentProportions[i][1] >= location) {
          idx = i;
          inSegmentProportion = (location - segmentProportions[i][0]) / segmentProportionalLengths[i];
          break;
        }
      }
    }
  }

  return {
    segment: dbo[idx],
    proportion: inSegmentProportion,
    index: idx
  };
};
let _segmentMultipliers = [null, [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
];
let _inverseSegmentMultipliers = [null, [-1, -1],
  [-1, 1],
  [1, 1],
  [1, -1]
];
let _pointOnLine = function (fromPoint, toPoint, distance) {
  let m = _gradient(fromPoint, toPoint);
  let s = _quadrant(fromPoint, toPoint);
  let segmentMultiplier = distance > 0 ? _segmentMultipliers[s] : _inverseSegmentMultipliers[s];
  let theta = Math.atan(m);
  let y = Math.abs(distance * Math.sin(theta)) * segmentMultiplier[1];
  let x = Math.abs(distance * Math.cos(theta)) * segmentMultiplier[0];
  return {
    x: fromPoint.x + x,
    y: fromPoint.y + y
  };
};
var _addSegmentConn = function (conn, type, params) {
  if (params.x1 === params.x2 && params.y1 === params.y2) {
    return;
  }
  let s = new Segments[type](params);
  dbo.push(s);
  totalLength += s.getLength();
  // conn.updateBounds(s);
};
var getPathData = function (segments) {
  let p = '';
  for (let i = 0; i < segments.length; i++) {
    p += getPath(segments[i], i === 0);
    p += ' ';
  }
  return p;
};
var _gradient = Biltong.gradient = function (p1, p2) {
  return _pointHelper(p1, p2, function (_p1, _p2) {
    if (_p2[0] == _p1[0]) { return _p2[1] > _p1[1] ? Infinity : -Infinity; } else if (_p2[1] == _p1[1]) { return _p2[0] > _p1[0] ? 0 : -0; } else { return (_p2[1] - _p1[1]) / (_p2[0] - _p1[0]); }
  });
};
  /**
   * @name Biltong.quadrant
   * @function
   * @desc Calculates the quadrant in which the angle between the two points lies.
   * @param {Point} p1 First point, either as a 2 entry array or object with `left` and `top` properties.
   * @param {Point} p2 Second point, either as a 2 entry array or object with `left` and `top` properties.
   * @return {Integer} The quadrant - 1 for upper right, 2 for lower right, 3 for lower left, 4 for upper left.
   */
var _quadrant = Biltong.quadrant = function (p1, p2) {
  return _pointHelper(p1, p2, function (_p1, _p2) {
    if (_p2[0] > _p1[0]) {
      return (_p2[1] > _p1[1]) ? 2 : 1;
    } else if (_p2[0] == _p1[0]) {
      return _p2[1] > _p1[1] ? 2 : 1;
    } else {
      return (_p2[1] > _p1[1]) ? 3 : 4;
    }
  });
};
  /**
   * @name Biltong.theta
   * @function
   * @desc Calculates the angle between the two points.
   * @param {Point} p1 First point, either as a 2 entry array or object with `left` and `top` properties.
   * @param {Point} p2 Second point, either as a 2 entry array or object with `left` and `top` properties.
   * @return {Float} The angle between the two points.
   */
let _theta = Biltong.theta = function (p1, p2) {
  return _pointHelper(p1, p2, function (_p1, _p2) {
    let m = _gradient(_p1, _p2);
    let t = Math.atan(m);
    let s = _quadrant(_p1, _p2);
    if ((s == 4 || s == 3)) t += Math.PI;
    if (t < 0) t += (2 * Math.PI);

    return t;
  });
};



var Segments = {
  /*
   * Class: AbstractSegment
   * A Connector is made up of 1..N Segments, each of which has a Type, such as 'Straight', 'Arc',
   * 'Bezier'. This is new from 1.4.2, and gives us a lot more flexibility when drawing connections: things such
   * as rounded corners for flowchart connectors, for example, or a straight line stub for Bezier connections, are
   * much easier to do now.
   *
   * A Segment is responsible for providing coordinates for painting it, and also must be able to report its length.
   *
   */
  AbstractSegment: function (params) {
    this.params = params;

    /**
     * Function: findClosestPointOnPath
     * Finds the closest point on this segment to the given [x, y],
     * returning both the x and y of the point plus its distance from
     * the supplied point, and its location along the length of the
     * path inscribed by the segment.  This implementation returns
     * Infinity for distance and null values for everything else;
     * subclasses are expected to override.
     */
    this.findClosestPointOnPath = function (x, y) {
      return {
        d: Infinity,
        x: null,
        y: null,
        l: null
      };
    };

    this.getBounds = function () {
      return {
        minX: Math.min(params.x1, params.x2),
        minY: Math.min(params.y1, params.y2),
        maxX: Math.max(params.x1, params.x2),
        maxY: Math.max(params.y1, params.y2)
      };
    };

    /**
     * Computes the list of points on the segment that intersect the given line.
     * @method lineIntersection
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {Array<[number, number]>}
     */
    this.lineIntersection = function (x1, y1, x2, y2) {
      return [];
    };

    /**
     * Computes the list of points on the segment that intersect the box with the given origin and size.
     * @method boxIntersection
     * @param {number} x1
     * @param {number} y1
     * @param {number} w
     * @param {number} h
     * @returns {Array<[number, number]>}
     */
    this.boxIntersection = function (x, y, w, h) {
      let a = [];
      a.push.apply(a, this.lineIntersection(x, y, x + w, y));
      a.push.apply(a, this.lineIntersection(x + w, y, x + w, y + h));
      a.push.apply(a, this.lineIntersection(x + w, y + h, x, y + h));
      a.push.apply(a, this.lineIntersection(x, y + h, x, y));
      return a;
    };

    /**
     * Computes the list of points on the segment that intersect the given bounding box, which is an object of the form { x:.., y:.., w:.., h:.. }.
     * @method lineIntersection
     * @param {BoundingRectangle} box
     * @returns {Array<[number, number]>}
     */
    this.boundingBoxIntersection = function (box) {
      return this.boxIntersection(box.x, box.y, box.w, box.y);
    };
  },
  Straight: function (params) {
    let _super = Segments.AbstractSegment.apply(this, arguments);
    let length; let m; let m2; let x1; let x2; let y1; let y2;
    let _recalc = function () {
      length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      m = _gradient({
        x: x1,
        y: y1
      }, {
        x: x2,
        y: y2
      });
      m2 = -1 / m;
    };

    this.type = 'Straight';

    this.getLength = function () {
      return length;
    };
    this.getGradient = function () {
      return m;
    };

    this.getCoordinates = function () {
      return {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
      };
    };
    this.setCoordinates = function (coords) {
      x1 = coords.x1;
      y1 = coords.y1;
      x2 = coords.x2;
      y2 = coords.y2;
      _recalc();
    };
    this.setCoordinates({
      x1: params.x1,
      y1: params.y1,
      x2: params.x2,
      y2: params.y2
    });

    this.getBounds = function () {
      return {
        minX: Math.min(x1, x2),
        minY: Math.min(y1, y2),
        maxX: Math.max(x1, x2),
        maxY: Math.max(y1, y2)
      };
    };

    /**
     * returns the point on the segment's path that is 'location' along the length of the path, where 'location' is a decimal from
     * 0 to 1 inclusive. for the straight line segment this is simple maths.
     */
    this.pointOnPath = function (location, absolute) {
      if (location === 0 && !absolute) {
        return {
          x: x1,
          y: y1
        };
      } else if (location === 1 && !absolute) {
        return {
          x: x2,
          y: y2
        };
      } else {
        let l = absolute ? location > 0 ? location : length + location : location * length;
        return _pointOnLine({
          x: x1,
          y: y1
        }, {
          x: x2,
          y: y2
        }, l);
      }
    };

    /**
     * returns the gradient of the segment at the given point - which for us is constant.
     */
    this.gradientAtPoint = function (_) {
      return m;
    };

    /**
     * returns the point on the segment's path that is 'distance' along the length of the path from 'location', where
     * 'location' is a decimal from 0 to 1 inclusive, and 'distance' is a number of pixels.
     * this hands off to jsPlumbUtil to do the maths, supplying two points and the distance.
     */
    this.pointAlongPathFrom = function (location, distance, absolute) {
      let p = this.pointOnPath(location, absolute);
      let farAwayPoint = distance <= 0 ? {
        x: x1,
        y: y1
      } : {
        x: x2,
        y: y2
      };

      /*
       location == 1 ? {
       x:x1 + ((x2 - x1) * 10),
       y:y1 + ((y1 - y2) * 10)
       } :
       */

      if (distance <= 0 && Math.abs(distance) > 1) {
        distance *= -1;
      }

      return _pointOnLine(p, farAwayPoint, distance);
    };

    // is c between a and b?
    let within = function (a, b, c) {
      return c >= Math.min(a, b) && c <= Math.max(a, b);
    };
    // find which of a and b is closest to c
    let closest = function (a, b, c) {
      return Math.abs(c - a) < Math.abs(c - b) ? a : b;
    };

    /**
     Function: findClosestPointOnPath
     Finds the closest point on this segment to [x,y]. See
     notes on this method in AbstractSegment.
     */
    this.findClosestPointOnPath = function (x, y) {
      let out = {
        d: Infinity,
        x: null,
        y: null,
        l: null,
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2
      };

      if (m === 0) {
        out.y = y1;
        out.x = within(x1, x2, x) ? x : closest(x1, x2, x);
      } else if (m === Infinity || m === -Infinity) {
        out.x = x1;
        out.y = within(y1, y2, y) ? y : closest(y1, y2, y);
      } else {
        // closest point lies on normal from given point to this line.
        let b = y1 - (m * x1);
        let b2 = y - (m2 * x);
        // y1 = m.x1 + b and y1 = m2.x1 + b2
        // so m.x1 + b = m2.x1 + b2
        // x1(m - m2) = b2 - b
        // x1 = (b2 - b) / (m - m2)
        let _x1 = (b2 - b) / (m - m2);
        let _y1 = (m * _x1) + b;

        out.x = within(x1, x2, _x1) ? _x1 : closest(x1, x2, _x1); // _x1;
        out.y = within(y1, y2, _y1) ? _y1 : closest(y1, y2, _y1); // _y1;
      }

      let fractionInSegment = lineLength([out.x, out.y], [x1, y1]);
      out.d = lineLength([x, y], [out.x, out.y]);
      out.l = fractionInSegment / length;
      return out;
    };

    let _pointLiesBetween = function (q, p1, p2) {
      return (p2 > p1) ? (p1 <= q && q <= p2) : (p1 >= q && q >= p2);
    };
    let _plb = _pointLiesBetween;

    /**
     * Calculates all intersections of the given line with this segment.
     * @param _x1
     * @param _y1
     * @param _x2
     * @param _y2
     * @returns {Array}
     */
    this.lineIntersection = function (_x1, _y1, _x2, _y2) {
      let m2 = Math.abs(gradient({
        x: _x1,
        y: _y1
      }, {
        x: _x2,
        y: _y2
      }));
      let m1 = Math.abs(m);
      let b = m1 === Infinity ? x1 : y1 - (m1 * x1);
      let out = [];
      let b2 = m2 === Infinity ? _x1 : _y1 - (m2 * _x1);

      // if lines parallel, no intersection
      if (m2 !== m1) {
        // perpendicular, segment horizontal
        if (m2 === Infinity && m1 === 0) {
          if (_plb(_x1, x1, x2) && _plb(y1, _y1, _y2)) {
            out = [_x1, y1]; // we return X on the incident line and Y from the segment
          }
        } else if (m2 === 0 && m1 === Infinity) {
          // perpendicular, segment vertical
          if (_plb(_y1, y1, y2) && _plb(x1, _x1, _x2)) {
            out = [x1, _y1]; // we return X on the segment and Y from the incident line
          }
        } else {
          let X, Y;
          if (m2 === Infinity) {
            // test line is a vertical line. where does it cross the segment?
            X = _x1;
            if (_plb(X, x1, x2)) {
              Y = (m1 * _x1) + b;
              if (_plb(Y, _y1, _y2)) {
                out = [X, Y];
              }
            }
          } else if (m2 === 0) {
            Y = _y1;
            // test line is a horizontal line. where does it cross the segment?
            if (_plb(Y, y1, y2)) {
              X = (_y1 - b) / m1;
              if (_plb(X, _x1, _x2)) {
                out = [X, Y];
              }
            }
          } else {
            // mX + b = m2X + b2
            // mX - m2X = b2 - b
            // X(m - m2) = b2 - b
            // X = (b2 - b) / (m - m2)
            // Y = mX + b
            X = (b2 - b) / (m1 - m2);
            Y = (m1 * X) + b;
            if (_plb(X, x1, x2) && _plb(Y, y1, y2)) {
              out = [X, Y];
            }
          }
        }
      }

      return out;
    };

    /**
     * Calculates all intersections of the given box with this segment. By default this method simply calls `lineIntersection` with each of the four
     * faces of the box; subclasses can override this if they think there's a faster way to compute the entire box at once.
     * @param x X position of top left corner of box
     * @param y Y position of top left corner of box
     * @param w width of box
     * @param h height of box
     * @returns {Array}
     */
    this.boxIntersection = function (x, y, w, h) {
      let a = [];
      a.push.apply(a, this.lineIntersection(x, y, x + w, y));
      a.push.apply(a, this.lineIntersection(x + w, y, x + w, y + h));
      a.push.apply(a, this.lineIntersection(x + w, y + h, x, y + h));
      a.push.apply(a, this.lineIntersection(x, y + h, x, y));
      return a;
    };

    /**
     * Calculates all intersections of the given bounding box with this segment. By default this method simply calls `lineIntersection` with each of the four
     * faces of the box; subclasses can override this if they think there's a faster way to compute the entire box at once.
     * @param box Bounding box, in { x:.., y:..., w:..., h:... } format.
     * @returns {Array}
     */
    this.boundingBoxIntersection = function (box) {
      return this.boxIntersection(box.x, box.y, box.w, box.h);
    };
  },

  /*
   Arc Segment. You need to supply:

   r   -   radius
   cx  -   center x for the arc
   cy  -   center y for the arc
   ac  -   whether the arc is anticlockwise or not. default is clockwise.

   and then either:

   startAngle  -   startAngle for the arc.
   endAngle    -   endAngle for the arc.

   or:

   x1          -   x for start point
   y1          -   y for start point
   x2          -   x for end point
   y2          -   y for end point

   */
  Arc: function (params) {
    let _super = Segments.AbstractSegment.apply(this, arguments);
    let _calcAngle = function (_x, _y) {
      return _theta([params.cx, params.cy], [_x, _y]);
    };
    let _calcAngleForLocation = function (segment, location) {
      if (segment.anticlockwise) {
        let sa = segment.startAngle < segment.endAngle ? segment.startAngle + TWO_PI : segment.startAngle;
        let s = Math.abs(sa - segment.endAngle);
        return sa - (s * location);
      } else {
        let ea = segment.endAngle < segment.startAngle ? segment.endAngle + TWO_PI : segment.endAngle;
        let ss = Math.abs(ea - segment.startAngle);

        return segment.startAngle + (ss * location);
      }
    };
    var TWO_PI = 2 * Math.PI;

    this.radius = params.r;
    this.anticlockwise = params.ac;
    this.type = 'Arc';

    if (params.startAngle && params.endAngle) {
      this.startAngle = params.startAngle;
      this.endAngle = params.endAngle;
      this.x1 = params.cx + (this.radius * Math.cos(params.startAngle));
      this.y1 = params.cy + (this.radius * Math.sin(params.startAngle));
      this.x2 = params.cx + (this.radius * Math.cos(params.endAngle));
      this.y2 = params.cy + (this.radius * Math.sin(params.endAngle));
    } else {
      this.startAngle = _calcAngle(params.x1, params.y1);
      this.endAngle = _calcAngle(params.x2, params.y2);
      this.x1 = params.x1;
      this.y1 = params.y1;
      this.x2 = params.x2;
      this.y2 = params.y2;
    }

    if (this.endAngle < 0) {
      this.endAngle += TWO_PI;
    }
    if (this.startAngle < 0) {
      this.startAngle += TWO_PI;
    }

    // segment is used by vml
    // this.segment = quadrant([this.x1, this.y1], [this.x2, this.y2]);

    // we now have startAngle and endAngle as positive numbers, meaning the
    // absolute difference (|d|) between them is the sweep (s) of this arc, unless the
    // arc is 'anticlockwise' in which case 's' is given by 2PI - |d|.

    let ea = this.endAngle < this.startAngle ? this.endAngle + TWO_PI : this.endAngle;
    this.sweep = Math.abs(ea - this.startAngle);
    if (this.anticlockwise) {
      this.sweep = TWO_PI - this.sweep;
    }
    let circumference = 2 * Math.PI * this.radius;
    let frac = this.sweep / TWO_PI;
    let length = circumference * frac;

    this.getLength = function () {
      return length;
    };

    this.getBounds = function () {
      return {
        minX: params.cx - params.r,
        maxX: params.cx + params.r,
        minY: params.cy - params.r,
        maxY: params.cy + params.r
      };
    };

    let VERY_SMALL_VALUE = 0.0000000001;
    let gentleRound = function (n) {
      let f = Math.floor(n);
      let r = Math.ceil(n);
      if (n - f < VERY_SMALL_VALUE) {
        return f;
      } else if (r - n < VERY_SMALL_VALUE) {
        return r;
      }
      return n;
    };

    /**
     * returns the point on the segment's path that is 'location' along the length of the path, where 'location' is a decimal from
     * 0 to 1 inclusive.
     */
    this.pointOnPath = function (location, absolute) {
      if (location === 0) {
        return {
          x: this.x1,
          y: this.y1,
          theta: this.startAngle
        };
      } else if (location === 1) {
        return {
          x: this.x2,
          y: this.y2,
          theta: this.endAngle
        };
      }

      if (absolute) {
        location = location / length;
      }

      let angle = _calcAngleForLocation(this, location);
      let _x = params.cx + (params.r * Math.cos(angle));
      let _y = params.cy + (params.r * Math.sin(angle));

      return {
        x: gentleRound(_x),
        y: gentleRound(_y),
        theta: angle
      };
    };

    /**
     * returns the gradient of the segment at the given point.
     */
    this.gradientAtPoint = function (location, absolute) {
      let p = this.pointOnPath(location, absolute);
      let m = normal([params.cx, params.cy], [p.x, p.y]);
      if (!this.anticlockwise && (m === Infinity || m === -Infinity)) {
        m *= -1;
      }
      return m;
    };

    this.pointAlongPathFrom = function (location, distance, absolute) {
      let p = this.pointOnPath(location, absolute);
      let arcSpan = distance / circumference * 2 * Math.PI;
      let dir = this.anticlockwise ? -1 : 1;
      let startAngle = p.theta + (dir * arcSpan);
      let startX = params.cx + (this.radius * Math.cos(startAngle));
      let startY = params.cy + (this.radius * Math.sin(startAngle));

      return {
        x: startX,
        y: startY
      };
    };

    // TODO: lineIntersection
  },

  Bezier: function (params) {
    this.curve = [{
      x: params.x1,
      y: params.y1
    },
    {
      x: params.cp1x,
      y: params.cp1y
    },
    {
      x: params.cp2x,
      y: params.cp2y
    },
    {
      x: params.x2,
      y: params.y2
    }
    ];

    let _isPoint = function (c) {
      return c[0].x === c[1].x && c[0].y === c[1].y;
    };

    let _dist = function (p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    let _compute = function (loc) {
      let EMPTY_POINT = {
        x: 0,
        y: 0
      };

      if (loc === 0) {
        return this.curve[0];
      }

      let degree = this.curve.length - 1;

      if (loc === 1) {
        return this.curve[degree];
      }

      let o = this.curve;
      let s = 1 - loc;

      if (degree === 0) {
        return this.curve[0];
      }

      if (degree === 1) {
        return {
          x: s * o[0].x + loc * o[1].x,
          y: s * o[0].y + loc * o[1].y
        };
      }

      if (degree < 4) {
        let l = s * s;
        let h = loc * loc;
        let u = 0;
        let m; let g; let f;

        if (degree === 2) {
          o = [o[0], o[1], o[2], EMPTY_POINT];
          m = l;
          g = 2 * (s * loc);
          f = h;
        } else if (degree === 3) {
          m = l * s;
          g = 3 * (l * loc);
          f = 3 * (s * h);
          u = loc * h;
        }

        return {
          x: m * o[0].x + g * o[1].x + f * o[2].x + u * o[3].x,
          y: m * o[0].y + g * o[1].y + f * o[2].y + u * o[3].y
        };
      } else {
        return EMPTY_POINT; // not supported.
      }
    }.bind(this);

    let _getLUT = function (steps) {
      let out = [];
      steps--;
      for (let n = 0; n <= steps; n++) {
        out.push(_compute(n / steps));
      }
      return out;
    };

    let _computeLength = function () {
      if (_isPoint(this.curve)) {
        this.length = 0;
      }

      let steps = 16;
      let lut = _getLUT(steps);
      this.length = 0;

      for (let i = 0; i < steps - 1; i++) {
        let a = lut[i];
        let b = lut[i + 1];
        this.length += _dist(a, b);
      }
    }.bind(this);

    let _super = Segments.AbstractSegment.apply(this, arguments);
    // although this is not a strictly rigorous determination of bounds
    // of a bezier curve, it works for the types of curves that this segment
    // type produces.
    this.bounds = {
      minX: Math.min(params.x1, params.x2, params.cp1x, params.cp2x),
      minY: Math.min(params.y1, params.y2, params.cp1y, params.cp2y),
      maxX: Math.max(params.x1, params.x2, params.cp1x, params.cp2x),
      maxY: Math.max(params.y1, params.y2, params.cp1y, params.cp2y)
    };

    this.type = 'Bezier';

    _computeLength();

    let _translateLocation = function (_curve, location, absolute) {
      if (absolute) {
        location = root.jsBezier.locationAlongCurveFrom(_curve, location > 0 ? 0 : 1, location);
      }

      return location;
    };

    /**
     * returns the point on the segment's path that is 'location' along the length of the path, where 'location' is a decimal from
     * 0 to 1 inclusive.
     */
    this.pointOnPath = function (location, absolute) {
      location = _translateLocation(this.curve, location, absolute);
      return root.jsBezier.pointOnCurve(this.curve, location);
    };

    /**
     * returns the gradient of the segment at the given point.
     */
    this.gradientAtPoint = function (location, absolute) {
      location = _translateLocation(this.curve, location, absolute);
      return root.jsBezier.gradientAtPoint(this.curve, location);
    };

    this.pointAlongPathFrom = function (location, distance, absolute) {
      location = _translateLocation(this.curve, location, absolute);
      return root.jsBezier.pointAlongCurveFrom(this.curve, location, distance);
    };

    this.getLength = function () {
      return this.length;
    };

    this.getBounds = function () {
      return this.bounds;
    };

    this.findClosestPointOnPath = function (x, y) {
      let p = root.jsBezier.nearestPointOnCurve({
        x: x,
        y: y
      }, this.curve);
      return {
        d: Math.sqrt(Math.pow(p.point.x - x, 2) + Math.pow(p.point.y - y, 2)),
        x: p.point.x,
        y: p.point.y,
        l: 1 - p.location,
        s: this
      };
    };

    this.lineIntersection = function (x1, y1, x2, y2) {
      return root.jsBezier.lineIntersection(x1, y1, x2, y2, this.curve);
    };
  }
};
