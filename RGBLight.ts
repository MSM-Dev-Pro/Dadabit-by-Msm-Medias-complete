/**
 * RGBLight support for Dadabit
 * Based on standard WS2812B LED implementation
 */

enum NeoPixelMode {
    RGB = 1,
    RGBW = 2,
    RGB_RGB = 3
}

namespace RGBLight {
    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        brightness: number;
        start: number;
        _length: number;
        _mode: NeoPixelMode;

        setPixelColor(pixeloffset: number, rgb: number): void {
            this.setPixelRGB(pixeloffset, rgb);
        }

        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0 || pixeloffset >= this._length)
                return;

            let stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }

            this.buf[pixeloffset + 0] = green;
            this.buf[pixeloffset + 1] = red;
            this.buf[pixeloffset + 2] = blue;
        }

        show() {
            ws2812b.sendBuffer(this.buf, this.pin);
        }

        clear(): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
            this.show();
        }

        length() {
            return this._length;
        }

        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        range(start: number, length: number): Strip {
            let strip = new Strip();
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip.brightness = this.brightness;
            strip.start = this.start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
            strip._mode = this._mode;
            return strip;
        }

        shift(offset: number = 1): void {
            this.buf.shift(-offset * (this._mode === NeoPixelMode.RGBW ? 4 : 3), this.start * (this._mode === NeoPixelMode.RGBW ? 4 : 3), this._length * (this._mode === NeoPixelMode.RGBW ? 4 : 3))
        }

        rotate(offset: number = 1): void {
            this.buf.rotate(-offset * (this._mode === NeoPixelMode.RGBW ? 4 : 3), this.start * (this._mode === NeoPixelMode.RGBW ? 4 : 3), this._length * (this._mode === NeoPixelMode.RGBW ? 4 : 3))
        }
    }

    export function create(pin: DigitalPin, numleds: number, mode: NeoPixelMode): Strip {
        let strip = new Strip();
        let stride = mode === NeoPixelMode.RGBW ? 4 : 3;
        strip.buf = pins.createBuffer(numleds * stride);
        strip.start = 0;
        strip._length = numleds;
        strip._mode = mode;
        strip.setBrightness(255);
        strip.pin = pin;
        return strip;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }

    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }

    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }

    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    export function colors(color: NeoPixelColors): number {
        return color;
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);
        
        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000);
        let h1 = Math.idiv(h, 60);
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;
        let r = 0;
        let g = 0;
        let b = 0;
        if (h1 == 0) {
            r = c; g = x; b = 0;
        } else if (h1 == 1) {
            r = x; g = c; b = 0;
        } else if (h1 == 2) {
            r = 0; g = c; b = x;
        } else if (h1 == 3) {
            r = 0; g = x; b = c;
        } else if (h1 == 4) {
            r = x; g = 0; b = c;
        } else if (h1 == 5) {
            r = c; g = 0; b = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r1 = r + m;
        let g1 = g + m;
        let b1 = b + m;
        return packRGB(r1, g1, b1);
    }
}

enum NeoPixelColors {
    Red = 0xFF0000,
    Orange = 0xFFA500,
    Yellow = 0xFFFF00,
    Green = 0x00FF00,
    Blue = 0x0000FF,
    Indigo = 0x4b0082,
    Violet = 0x8a2be2,
    Purple = 0xFF00FF,
    White = 0xFFFFFF,
    Black = 0x000000
}
