"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_extra_1 = require("fs-extra");
const os_1 = require("os");

/** https://stackoverflow.com/questions/52156713/fluent-ffmpeg-h264-to-gif-throwing-error-1 */
const videoToGif = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = `${(0, os_1.tmpdir)()}/${Math.random().toString(36)}`;
    const [video, gif] = ['video', 'gif'].map((ext) => `${filename}.${ext}`);
    yield (0, fs_extra_1.writeFile)(video, data);

    // Updated FFmpeg configuration to include no-dither and split filter
    yield new Promise((resolveFfmpeg, rejectFfmpeg) => {
        (0, fluent_ffmpeg_1.default)(video)
            .outputOptions([
                //'-vf', '[0:v]split[a][b];[a]palettegen=max_colors=256:reserve_transparent=0[p];[b][p]paletteuse=dither=none', // No dither with split and palettegen/paletteuse
                '-vf', '[0:v]fps=10,split[a][b];[a]palettegen=max_colors=128:reserve_transparent=0[p];[b][p]paletteuse=dither=none',

                '-loop', '0',
                '-lossless', '0',
                '-t', '6',
                '-preset', 'ultrafast'
            ])
            .toFormat('gif')
            .save(gif)
            .on('end', resolveFfmpeg)
            .on('error', rejectFfmpeg);
    });

    const buffer = yield (0, fs_extra_1.readFile)(gif);

    // Clean up temporary files
    [video, gif].forEach((file) => (0, fs_extra_1.unlink)(file));

    return buffer;
});

exports.default = videoToGif;
