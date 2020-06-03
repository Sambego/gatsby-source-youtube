"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var axios = require("axios");
var get = require("lodash/get");
var normalize = require("./normalize");

function getApi() {
  var rateLimit = 500;
  var lastCalled = null;

  var rateLimiter = function rateLimiter(call) {
    var now = Date.now();
    if (lastCalled) {
      lastCalled += rateLimit;
      var wait = lastCalled - now;
      if (wait > 0) {
        return new Promise(function (resolve) {
          return setTimeout(function () {
            return resolve(call);
          }, wait);
        });
      }
    }
    lastCalled = now;
    return call;
  };

  var api = axios.create({
    baseURL: "https://www.googleapis.com/youtube/v3/"
  });

  api.interceptors.request.use(rateLimiter);

  return api;
}

exports.sourceNodes = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref, _ref2) {
    var boundActionCreators = _ref.boundActionCreators,
        store = _ref.store,
        cache = _ref.cache,
        createNodeId = _ref.createNodeId;
    var channelId = _ref2.channelId,
        playlistId = _ref2.playlistId,
        apiKey = _ref2.apiKey,
        _ref2$maxVideos = _ref2.maxVideos,
        maxVideos = _ref2$maxVideos === undefined ? 50 : _ref2$maxVideos;

    var createNode, api, isChannel, channelOrPlaylistId, requestEndpoint, requestUrl, channelResp, channelData, _videos, uploadsId, videos, pageSize, videoResp, _videos2, nextPageToken;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNode = boundActionCreators.createNode;
            api = getApi();
            _context.prev = 2;
            isChannel = !!channelId;
            channelOrPlaylistId = isChannel ? channelId : playlistId;
            requestEndpoint = isChannel ? "channels" : "playlists";
            requestUrl = requestEndpoint + "?part=contentDetails&id=" + channelOrPlaylistId + "&key=" + apiKey;
            _context.next = 9;
            return api.get(requestUrl);

          case 9:
            channelResp = _context.sent;
            channelData = channelResp.data.items[0];

            if (!channelData) {
              _context.next = 34;
              break;
            }

            uploadsId = isChannel ? get(channelData, "contentDetails.relatedPlaylists.uploads") : playlistId;
            videos = [];
            pageSize = Math.min(50, maxVideos);
            _context.next = 17;
            return api.get("playlistItems?part=snippet%2CcontentDetails%2Cstatus&maxResults=" + pageSize + "&playlistId=" + uploadsId + "&key=" + apiKey);

          case 17:
            videoResp = _context.sent;

            (_videos = videos).push.apply(_videos, _toConsumableArray(videoResp.data.items));

          case 19:
            if (!(videoResp.data.nextPageToken && videos.length < maxVideos)) {
              _context.next = 28;
              break;
            }

            pageSize = Math.min(50, maxVideos - videos.length);
            nextPageToken = videoResp.data.nextPageToken;
            _context.next = 24;
            return api.get("playlistItems?part=snippet%2CcontentDetails%2Cstatus&maxResults=" + pageSize + "&pageToken=" + nextPageToken + "&playlistId=" + uploadsId + "&key=" + apiKey);

          case 24:
            videoResp = _context.sent;

            (_videos2 = videos).push.apply(_videos2, _toConsumableArray(videoResp.data.items));
            _context.next = 19;
            break;

          case 28:

            videos = normalize.normalizeRecords(videos);
            videos = normalize.createGatsbyIds(videos, createNodeId);
            _context.next = 32;
            return normalize.downloadThumbnails({
              items: videos,
              store: store,
              cache: cache,
              createNode: createNode
            });

          case 32:
            videos = _context.sent;

            normalize.createNodesFromEntities(videos, createNode);

          case 34:
            return _context.abrupt("return");

          case 37:
            _context.prev = 37;
            _context.t0 = _context["catch"](2);

            console.error(_context.t0);
            process.exit(1);

          case 41:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[2, 37]]);
  }));

  return function (_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}();