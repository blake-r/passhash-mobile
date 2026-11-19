import CoreText
import Foundation

let fontName = "Monaco"
let fontSize: CGFloat = 1000
let chars: [Character] = ["#", "*"]

let font = CTFontCreateWithName(fontName as CFString, fontSize, nil)

func pathToSVG(_ path: CGPath) -> String {
    var parts: [String] = []
    path.applyWithBlock { el in
        let p = el.pointee
        let pts = p.points
        let f: (CGFloat) -> String = { String(format: "%.1f", $0) }
        switch p.type {
        case .moveToPoint:
            parts.append("M\(f(pts[0].x)) \(f(pts[0].y))")
        case .addLineToPoint:
            parts.append("L\(f(pts[0].x)) \(f(pts[0].y))")
        case .addQuadCurveToPoint:
            parts.append("Q\(f(pts[0].x)) \(f(pts[0].y)) \(f(pts[1].x)) \(f(pts[1].y))")
        case .addCurveToPoint:
            parts.append("C\(f(pts[0].x)) \(f(pts[0].y)) \(f(pts[1].x)) \(f(pts[1].y)) \(f(pts[2].x)) \(f(pts[2].y))")
        case .closeSubpath:
            parts.append("Z")
        @unknown default:
            break
        }
    }
    return parts.joined(separator: " ")
}

for ch in chars {
    var u = Array(String(ch).utf16)
    var glyph = [CGGlyph](repeating: 0, count: 1)
    let ok = CTFontGetGlyphsForCharacters(font, &u, &glyph, 1)
    guard ok, glyph[0] != 0 else { print("NO GLYPH for \(ch)"); continue }
    // Flip Y so the path is usable directly in SVG (y-down), baseline at y=0.
    var t = CGAffineTransform(scaleX: 1, y: -1)
    guard let p = CTFontCreatePathForGlyph(font, glyph[0], &t) else { continue }
    let bbox = p.boundingBoxOfPath
    let advance = CTFontGetAdvancesForGlyphs(font, .horizontal, [glyph[0]], nil, 1)
    print("=== \(ch) ===")
    print("bbox: x=\(bbox.origin.x) y=\(bbox.origin.y) w=\(bbox.width) h=\(bbox.height) advance=\(advance)")
    print(pathToSVG(p))
}
