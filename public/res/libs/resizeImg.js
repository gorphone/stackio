define([
    "jquery"
], function( $ ) {
    var EXIF = (function() {

        var debug = false;

        var ExifTags = {

            // version tags
            0x9000 : "ExifVersion",             // EXIF version
            0xA000 : "FlashpixVersion",         // Flashpix format version

            // colorspace tags
            0xA001 : "ColorSpace",              // Color space information tag

            // image configuration
            0xA002 : "PixelXDimension",         // Valid width of meaningful image
            0xA003 : "PixelYDimension",         // Valid height of meaningful image
            0x9101 : "ComponentsConfiguration", // Information about channels
            0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

            // user information
            0x927C : "MakerNote",               // Any desired information written by the manufacturer
            0x9286 : "UserComment",             // Comments by user

            // related file
            0xA004 : "RelatedSoundFile",        // Name of related sound file

            // date and time
            0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
            0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
            0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
            0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
            0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

            // picture-taking conditions
            0x829A : "ExposureTime",            // Exposure time (in seconds)
            0x829D : "FNumber",                 // F number
            0x8822 : "ExposureProgram",         // Exposure program
            0x8824 : "SpectralSensitivity",     // Spectral sensitivity
            0x8827 : "ISOSpeedRatings",         // ISO speed rating
            0x8828 : "OECF",                    // Optoelectric conversion factor
            0x9201 : "ShutterSpeedValue",       // Shutter speed
            0x9202 : "ApertureValue",           // Lens aperture
            0x9203 : "BrightnessValue",         // Value of brightness
            0x9204 : "ExposureBias",            // Exposure bias
            0x9205 : "MaxApertureValue",        // Smallest F number of lens
            0x9206 : "SubjectDistance",         // Distance to subject in meters
            0x9207 : "MeteringMode",            // Metering mode
            0x9208 : "LightSource",             // Kind of light source
            0x9209 : "Flash",                   // Flash status
            0x9214 : "SubjectArea",             // Location and area of main subject
            0x920A : "FocalLength",             // Focal length of the lens in mm
            0xA20B : "FlashEnergy",             // Strobe energy in BCPS
            0xA20C : "SpatialFrequencyResponse",    // 
            0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
            0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
            0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
            0xA214 : "SubjectLocation",         // Location of subject in image
            0xA215 : "ExposureIndex",           // Exposure index selected on camera
            0xA217 : "SensingMethod",           // Image sensor type
            0xA300 : "FileSource",              // Image source (3 == DSC)
            0xA301 : "SceneType",               // Scene type (1 == directly photographed)
            0xA302 : "CFAPattern",              // Color filter array geometric pattern
            0xA401 : "CustomRendered",          // Special processing
            0xA402 : "ExposureMode",            // Exposure mode
            0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
            0xA404 : "DigitalZoomRation",       // Digital zoom ratio
            0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
            0xA406 : "SceneCaptureType",        // Type of scene
            0xA407 : "GainControl",             // Degree of overall image gain adjustment
            0xA408 : "Contrast",                // Direction of contrast processing applied by camera
            0xA409 : "Saturation",              // Direction of saturation processing applied by camera
            0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
            0xA40B : "DeviceSettingDescription",    // 
            0xA40C : "SubjectDistanceRange",    // Distance to subject

            // other tags
            0xA005 : "InteroperabilityIFDPointer",
            0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
        };

        var TiffTags = {
            0x0100 : "ImageWidth",
            0x0101 : "ImageHeight",
            0x8769 : "ExifIFDPointer",
            0x8825 : "GPSInfoIFDPointer",
            0xA005 : "InteroperabilityIFDPointer",
            0x0102 : "BitsPerSample",
            0x0103 : "Compression",
            0x0106 : "PhotometricInterpretation",
            0x0112 : "Orientation",
            0x0115 : "SamplesPerPixel",
            0x011C : "PlanarConfiguration",
            0x0212 : "YCbCrSubSampling",
            0x0213 : "YCbCrPositioning",
            0x011A : "XResolution",
            0x011B : "YResolution",
            0x0128 : "ResolutionUnit",
            0x0111 : "StripOffsets",
            0x0116 : "RowsPerStrip",
            0x0117 : "StripByteCounts",
            0x0201 : "JPEGInterchangeFormat",
            0x0202 : "JPEGInterchangeFormatLength",
            0x012D : "TransferFunction",
            0x013E : "WhitePoint",
            0x013F : "PrimaryChromaticities",
            0x0211 : "YCbCrCoefficients",
            0x0214 : "ReferenceBlackWhite",
            0x0132 : "DateTime",
            0x010E : "ImageDescription",
            0x010F : "Make",
            0x0110 : "Model",
            0x0131 : "Software",
            0x013B : "Artist",
            0x8298 : "Copyright"
        };

        var GPSTags = {
            0x0000 : "GPSVersionID",
            0x0001 : "GPSLatitudeRef",
            0x0002 : "GPSLatitude",
            0x0003 : "GPSLongitudeRef",
            0x0004 : "GPSLongitude",
            0x0005 : "GPSAltitudeRef",
            0x0006 : "GPSAltitude",
            0x0007 : "GPSTimeStamp",
            0x0008 : "GPSSatellites",
            0x0009 : "GPSStatus",
            0x000A : "GPSMeasureMode",
            0x000B : "GPSDOP",
            0x000C : "GPSSpeedRef",
            0x000D : "GPSSpeed",
            0x000E : "GPSTrackRef",
            0x000F : "GPSTrack",
            0x0010 : "GPSImgDirectionRef",
            0x0011 : "GPSImgDirection",
            0x0012 : "GPSMapDatum",
            0x0013 : "GPSDestLatitudeRef",
            0x0014 : "GPSDestLatitude",
            0x0015 : "GPSDestLongitudeRef",
            0x0016 : "GPSDestLongitude",
            0x0017 : "GPSDestBearingRef",
            0x0018 : "GPSDestBearing",
            0x0019 : "GPSDestDistanceRef",
            0x001A : "GPSDestDistance",
            0x001B : "GPSProcessingMethod",
            0x001C : "GPSAreaInformation",
            0x001D : "GPSDateStamp",
            0x001E : "GPSDifferential"
        };

        var StringValues = {
            ExposureProgram : {
                0 : "Not defined",
                1 : "Manual",
                2 : "Normal program",
                3 : "Aperture priority",
                4 : "Shutter priority",
                5 : "Creative program",
                6 : "Action program",
                7 : "Portrait mode",
                8 : "Landscape mode"
            },
            MeteringMode : {
                0 : "Unknown",
                1 : "Average",
                2 : "CenterWeightedAverage",
                3 : "Spot",
                4 : "MultiSpot",
                5 : "Pattern",
                6 : "Partial",
                255 : "Other"
            },
            LightSource : {
                0 : "Unknown",
                1 : "Daylight",
                2 : "Fluorescent",
                3 : "Tungsten (incandescent light)",
                4 : "Flash",
                9 : "Fine weather",
                10 : "Cloudy weather",
                11 : "Shade",
                12 : "Daylight fluorescent (D 5700 - 7100K)",
                13 : "Day white fluorescent (N 4600 - 5400K)",
                14 : "Cool white fluorescent (W 3900 - 4500K)",
                15 : "White fluorescent (WW 3200 - 3700K)",
                17 : "Standard light A",
                18 : "Standard light B",
                19 : "Standard light C",
                20 : "D55",
                21 : "D65",
                22 : "D75",
                23 : "D50",
                24 : "ISO studio tungsten",
                255 : "Other"
            },
            Flash : {
                0x0000 : "Flash did not fire",
                0x0001 : "Flash fired",
                0x0005 : "Strobe return light not detected",
                0x0007 : "Strobe return light detected",
                0x0009 : "Flash fired, compulsory flash mode",
                0x000D : "Flash fired, compulsory flash mode, return light not detected",
                0x000F : "Flash fired, compulsory flash mode, return light detected",
                0x0010 : "Flash did not fire, compulsory flash mode",
                0x0018 : "Flash did not fire, auto mode",
                0x0019 : "Flash fired, auto mode",
                0x001D : "Flash fired, auto mode, return light not detected",
                0x001F : "Flash fired, auto mode, return light detected",
                0x0020 : "No flash function",
                0x0041 : "Flash fired, red-eye reduction mode",
                0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
                0x0047 : "Flash fired, red-eye reduction mode, return light detected",
                0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
                0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
                0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
                0x0059 : "Flash fired, auto mode, red-eye reduction mode",
                0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
                0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
            },
            SensingMethod : {
                1 : "Not defined",
                2 : "One-chip color area sensor",
                3 : "Two-chip color area sensor",
                4 : "Three-chip color area sensor",
                5 : "Color sequential area sensor",
                7 : "Trilinear sensor",
                8 : "Color sequential linear sensor"
            },
            SceneCaptureType : {
                0 : "Standard",
                1 : "Landscape",
                2 : "Portrait",
                3 : "Night scene"
            },
            SceneType : {
                1 : "Directly photographed"
            },
            CustomRendered : {
                0 : "Normal process",
                1 : "Custom process"
            },
            WhiteBalance : {
                0 : "Auto white balance",
                1 : "Manual white balance"
            },
            GainControl : {
                0 : "None",
                1 : "Low gain up",
                2 : "High gain up",
                3 : "Low gain down",
                4 : "High gain down"
            },
            Contrast : {
                0 : "Normal",
                1 : "Soft",
                2 : "Hard"
            },
            Saturation : {
                0 : "Normal",
                1 : "Low saturation",
                2 : "High saturation"
            },
            Sharpness : {
                0 : "Normal",
                1 : "Soft",
                2 : "Hard"
            },
            SubjectDistanceRange : {
                0 : "Unknown",
                1 : "Macro",
                2 : "Close view",
                3 : "Distant view"
            },
            FileSource : {
                3 : "DSC"
            },

            Components : {
                0 : "",
                1 : "Y",
                2 : "Cb",
                3 : "Cr",
                4 : "R",
                5 : "G",
                6 : "B"
            }
        };

        function addEvent(element, event, handler) {
            if (element.addEventListener) { 
                element.addEventListener(event, handler, false); 
            } else if (element.attachEvent) { 
                element.attachEvent("on" + event, handler); 
            }
        }

        function imageHasData(img) {
            return !!(img.exifdata);
        }


        function base64ToArrayBuffer(base64, contentType) {
            contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
            base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
            var binary = atob(base64);
            var len = binary.length;
            var buffer = new ArrayBuffer(len);
            var view = new Uint8Array(buffer);
            for (var i = 0; i < len; i++) {
                view[i] = binary.charCodeAt(i);
            }
            return buffer;
        }

        function objectURLToBlob(url, callback) {
            var http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.responseType = "blob";
            http.onload = function(e) {
                if (this.status == 200 || this.status === 0) {
                    callback(this.response);
                }
            };
            http.send();
        }

        function getImageData(img, callback) {
            function handleBinaryFile(binFile) {
                var data = findEXIFinJPEG(binFile);
                var iptcdata = findIPTCinJPEG(binFile);
                img.exifdata = data || {};
                img.iptcdata = iptcdata || {};
                if (callback) {
                    callback.call(img);
                }
            }

            if (img instanceof Image || img instanceof HTMLImageElement) {
                if (/^data\:/i.test(img.src)) { // Data URI
                    var arrayBuffer = base64ToArrayBuffer(img.src);
                    handleBinaryFile(arrayBuffer);

                } else if (/^blob\:/i.test(img.src)) { // Object URL
                    var fileReader = new FileReader();
                    fileReader.onload = function(e) {
                        handleBinaryFile(e.target.result);
                    };
                    objectURLToBlob(img.src, function (blob) {
                        fileReader.readAsArrayBuffer(blob);
                    });
                } else {
                    var http = new XMLHttpRequest();
                    http.onload = function() {
                        if (http.status == "200") {
                            handleBinaryFile(http.response);
                        } else {
                            throw "Could not load image";
                        }
                        http = null;
                    };
                    http.open("GET", img.src, true);
                    http.responseType = "arraybuffer";
                    http.send(null);
                }
            } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    if (debug) console.log("Got file of length " + e.target.result.byteLength);
                    handleBinaryFile(e.target.result);
                };

                fileReader.readAsArrayBuffer(img);
            }
        }

        function findEXIFinJPEG(file) {
            var dataView = new DataView(file);
            
            if (debug) console.log("Got file of length " + file.byteLength);
            if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
                if (debug) console.log("Not a valid JPEG");
                return false; // not a valid jpeg
            }

            var offset = 2,
                length = file.byteLength,
                marker;

            while (offset < length) {
                if (dataView.getUint8(offset) != 0xFF) {
                    if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                    return false; // not a valid marker, something is wrong
                }

                marker = dataView.getUint8(offset + 1);
                if (debug) console.log(marker);

                // we could implement handling for other markers here, 
                // but we're only looking for 0xFFE1 for EXIF data

                if (marker == 225) {
                    if (debug) console.log("Found 0xFFE1 marker");
                    
                    return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);
                    
                    // offset += 2 + file.getShortAt(offset+2, true);

                } else {
                    offset += 2 + dataView.getUint16(offset+2);
                }

            }

        }
        
        function findIPTCinJPEG(file) {
            var dataView = new DataView(file);
            
            if (debug) console.log("Got file of length " + file.byteLength);
            if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
                if (debug) console.log("Not a valid JPEG");
                return false; // not a valid jpeg
            }
            
            var offset = 2,
                length = file.byteLength;
            
            
            var isFieldSegmentStart = function(dataView, offset){
                return (
                    dataView.getUint8(offset) === 0x38 &&
                    dataView.getUint8(offset+1) === 0x42 &&
                    dataView.getUint8(offset+2) === 0x49 &&
                    dataView.getUint8(offset+3) === 0x4D &&
                    dataView.getUint8(offset+4) === 0x04 &&
                    dataView.getUint8(offset+5) === 0x04
                );
            };
            
            while (offset < length) {
            
                if ( isFieldSegmentStart(dataView, offset )){
                
                    // Get the length of the name header (which is padded to an even number of bytes)
                    var nameHeaderLength = dataView.getUint8(offset+7);
                    if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                    // Check for pre photoshop 6 format
                    if(nameHeaderLength === 0) {
                        // Always 4 
                        nameHeaderLength = 4;
                    }
                
                    var startOffset = offset + 8 + nameHeaderLength;
                    var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);
                
                    return readIPTCData(file, startOffset, sectionLength);
                
                    break;
            
                }
            
            
                // Not the marker, continue searching
                offset++;

            }

        }
        var IptcFieldMap = {
            0x78 : 'caption',
            0x6E : 'credit',
            0x19 : 'keywords',
            0x37 : 'dateCreated',
            0x50 : 'byline',
            0x55 : 'bylineTitle',
            0x7A : 'captionWriter',
            0x69 : 'headline',
            0x74 : 'copyright',
            0x0F : 'category'
        };
        function readIPTCData(file, startOffset, sectionLength){
            var dataView = new DataView(file);
            var data = {};
            var fieldValue, fieldName, dataSize, segmentType, segmentSize;
            var segmentStartPos = startOffset;
            while(segmentStartPos < startOffset+sectionLength) {
                if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
                    segmentType = dataView.getUint8(segmentStartPos+2);
                    if(segmentType in IptcFieldMap) {
                        dataSize = dataView.getInt16(segmentStartPos+3);
                        segmentSize = dataSize + 5;
                        fieldName = IptcFieldMap[segmentType];
                        fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                        // Check if we already stored a value with this name
                        if(data.hasOwnProperty(fieldName)) {
                            // Value already stored with this name, create multivalue field
                            if(data[fieldName] instanceof Array) {
                                data[fieldName].push(fieldValue);
                            }
                            else {
                                data[fieldName] = [data[fieldName], fieldValue];
                            }
                        }
                        else {
                            data[fieldName] = fieldValue;
                        }
                    }
                
                }
                segmentStartPos++;
            }
            return data;
        }
        
        

        function readTags(file, tiffStart, dirStart, strings, bigEnd) {
            var entries = file.getUint16(dirStart, !bigEnd),
                tags = {}, 
                entryOffset, tag,
                i;
                
            for (i=0;i<entries;i++) {
                entryOffset = dirStart + i*12 + 2;
                tag = strings[file.getUint16(entryOffset, !bigEnd)];
                if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
                tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
            }
            return tags;
        }


        function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
            var type = file.getUint16(entryOffset+2, !bigEnd),
                numValues = file.getUint32(entryOffset+4, !bigEnd),
                valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
                offset,
                vals, val, n,
                numerator, denominator;

            switch (type) {
                case 1: // byte, 8-bit unsigned int
                case 7: // undefined, 8-bit byte, value depending on field
                    if (numValues == 1) {
                        return file.getUint8(entryOffset + 8, !bigEnd);
                    } else {
                        offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getUint8(offset + n);
                        }
                        return vals;
                    }

                case 2: // ascii, 8-bit byte
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    return getStringFromDB(file, offset, numValues-1);

                case 3: // short, 16 bit int
                    if (numValues == 1) {
                        return file.getUint16(entryOffset + 8, !bigEnd);
                    } else {
                        offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                        }
                        return vals;
                    }

                case 4: // long, 32 bit int
                    if (numValues == 1) {
                        return file.getUint32(entryOffset + 8, !bigEnd);
                    } else {
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                        }
                        return vals;
                    }

                case 5:    // rational = two long values, first is numerator, second is denominator
                    if (numValues == 1) {
                        numerator = file.getUint32(valueOffset, !bigEnd);
                        denominator = file.getUint32(valueOffset+4, !bigEnd);
                        val = new Number(numerator / denominator);
                        val.numerator = numerator;
                        val.denominator = denominator;
                        return val;
                    } else {
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                            denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                            vals[n] = new Number(numerator / denominator);
                            vals[n].numerator = numerator;
                            vals[n].denominator = denominator;
                        }
                        return vals;
                    }

                case 9: // slong, 32 bit signed int
                    if (numValues == 1) {
                        return file.getInt32(entryOffset + 8, !bigEnd);
                    } else {
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                        }
                        return vals;
                    }

                case 10: // signed rational, two slongs, first is numerator, second is denominator
                    if (numValues == 1) {
                        return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                    } else {
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                        }
                        return vals;
                    }
            }
        }

        function getStringFromDB(buffer, start, length) {
            var outstr = "";
            for (n = start; n < start+length; n++) {
                outstr += String.fromCharCode(buffer.getUint8(n));
            }
            return outstr;
        }
        
        function readEXIFData(file, start) {
            if (getStringFromDB(file, start, 4) != "Exif") {
                if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
                return false;
            }

            var bigEnd,
                tags, tag,
                exifData, gpsData,
                tiffOffset = start + 6;

            // test for TIFF validity and endianness
            if (file.getUint16(tiffOffset) == 0x4949) {
                bigEnd = false;
            } else if (file.getUint16(tiffOffset) == 0x4D4D) {
                bigEnd = true;
            } else {
                if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
                return false;
            }

            if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
                if (debug) console.log("Not valid TIFF data! (no 0x002A)");
                return false;
            }

            var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

            if (firstIFDOffset < 0x00000008) {
                if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
                return false;
            }

            tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

            if (tags.ExifIFDPointer) {
                exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
                for (tag in exifData) {
                    switch (tag) {
                        case "LightSource" :
                        case "Flash" :
                        case "MeteringMode" :
                        case "ExposureProgram" :
                        case "SensingMethod" :
                        case "SceneCaptureType" :
                        case "SceneType" :
                        case "CustomRendered" :
                        case "WhiteBalance" : 
                        case "GainControl" : 
                        case "Contrast" :
                        case "Saturation" :
                        case "Sharpness" : 
                        case "SubjectDistanceRange" :
                        case "FileSource" :
                            exifData[tag] = StringValues[tag][exifData[tag]];
                            break;
            
                        case "ExifVersion" :
                        case "FlashpixVersion" :
                            exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                            break;
            
                        case "ComponentsConfiguration" : 
                            exifData[tag] = 
                                StringValues.Components[exifData[tag][0]] +
                                StringValues.Components[exifData[tag][1]] +
                                StringValues.Components[exifData[tag][2]] +
                                StringValues.Components[exifData[tag][3]];
                            break;
                    }
                    tags[tag] = exifData[tag];
                }
            }

            if (tags.GPSInfoIFDPointer) {
                gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
                for (tag in gpsData) {
                    switch (tag) {
                        case "GPSVersionID" : 
                            gpsData[tag] = gpsData[tag][0] +
                                "." + gpsData[tag][1] +
                                "." + gpsData[tag][2] +
                                "." + gpsData[tag][3];
                            break;
                    }
                    tags[tag] = gpsData[tag];
                }
            }

            return tags;
        }


        function getData(img, callback) {
            if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;
            
            if (!imageHasData(img)) {
                getImageData(img, callback);
            } else {
                if (callback) {
                    callback.call(img);
                }
            }
            return true;
        }

        function getTag(img, tag) {
            if (!imageHasData(img)) return;
            return img.exifdata[tag];
        }

        function getAllTags(img) {
            if (!imageHasData(img)) return {};
            var a, 
                data = img.exifdata,
                tags = {};
            for (a in data) {
                if (data.hasOwnProperty(a)) {
                    tags[a] = data[a];
                }
            }
            return tags;
        }

        function pretty(img) {
            if (!imageHasData(img)) return "";
            var a,
                data = img.exifdata,
                strPretty = "";
            for (a in data) {
                if (data.hasOwnProperty(a)) {
                    if (typeof data[a] == "object") {
                        if (data[a] instanceof Number) {
                            strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                        } else {
                            strPretty += a + " : [" + data[a].length + " values]\r\n";
                        }
                    } else {
                        strPretty += a + " : " + data[a] + "\r\n";
                    }
                }
            }
            return strPretty;
        }

        function readFromBinaryFile(file) {
            return findEXIFinJPEG(file);
        }

       
        return {
            readFromBinaryFile : readFromBinaryFile,
            pretty : pretty,
            getTag : getTag,
            getAllTags : getAllTags,
            getData : getData,
            
            Tags : ExifTags,
            TiffTags : TiffTags,
            GPSTags : GPSTags,
            StringValues : StringValues
        };

    })();

    $.fn.resizeImg = function (obj) {
        var fReader = new FileReader(),
            URL = window.URL || window.webkitURL,
            blob = null,
            file;


        fReader.onload =  function(e){
            var dataArr = e.target.result;


            //图片方向不对的问题
            var exif = EXIF.readFromBinaryFile(dataArr);

            // 执行前函数
            if($.isFunction(obj.before)) { obj.before(this, blob, file) };

            _create(blob, file, exif.Orientation);
        };

        this.on('change', function () {
            file = this.files[0];
            console.log( 'onchange' );
            blob = URL.createObjectURL(file);

            fReader.readAsArrayBuffer(file);

            console.log( 111111 );

            this.value = '';   // 清空临时数据
        });




        /**
         * 生成base64
         * @param blob 通过file获得的二进制
         */
        function _create(blob, file, orientation) {
            var img = new Image();
            img.src = blob;

            img.onload = function () {
                var that = this;

                //生成比例
                var w = that.width,
                    h = that.height,
                    scale = w / h;
                w = obj.width || w;
                h = w / scale;

                //生成canvas
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                $(canvas).attr({width : w, height : h});
                ctx.drawImage(that, 0, 0, w, h);

                /**
                 * 生成base64
                 * 兼容修复移动设备需要引入mobileBUGFix.js
                 */
                var base64 = canvas.toDataURL('image/jpeg', obj.quality || 0.8 );

                // 修复IOS
                if( navigator.userAgent.match(/iphone/i) && MegaPixImage ) {
                    var mpImg = new MegaPixImage(img);
                    mpImg.render(canvas, { maxWidth: w, maxHeight: h, quality: obj.quality || 0.8, orientation: orientation});
                    base64 = canvas.toDataURL('image/jpeg', obj.quality || 0.8 );
                }

                //修复android
                if( navigator.userAgent.match(/Android/i) && JPEGEncoder ) {
                    var angleInRadians,
                        dw = w,
                        dh = h;

                    ctx.clearRect ( 0 , 0 , w , h );

                    switch(orientation){
                        case 8:
                            angleInRadians = -90*Math.PI/180;
                            dw = w * scale;
                            dh = w;
                            $(canvas).attr({width : w, height : dw });
                            h = w * scale;
                            break;
                        case 3:
                            angleInRadians = 180*Math.PI/180;
                            break;
                        case 6:
                            angleInRadians = 90*Math.PI/180;
                            dw = w * scale;
                            dh = w;
                            h = w * scale;
                            $(canvas).attr({width : w, height : dw });
                            break;
                    }

                    var x = canvas.width / 2;
                    var y = canvas.height / 2;
                    ctx.translate(x, y);
                    ctx.rotate(angleInRadians);
                    ctx.drawImage(that, -dw / 2, -dh / 2, dw,  dh );
                    ctx.rotate(-angleInRadians);
                    ctx.translate(-x, -y);

                    h = ~~(h);
                    var encoder = new JPEGEncoder();
                    base64 = encoder.encode(ctx.getImageData(0,0,w,h), obj.quality * 100 || 80 );
                }

                // 生成结果
                var result = {
                    base64 : base64,
                    clearBase64: base64.substr( base64.indexOf(',') + 1 )
                };

                // 执行后函数
                obj.success(result);
            };
        }
    };

    /* jpeg_encoder_basic.js  for android jpeg压缩质量修复 */
    function JPEGEncoder(a){function I(a){var c,i,j,k,l,m,n,o,p,b=[16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99];for(c=0;64>c;c++)i=d((b[c]*a+50)/100),1>i?i=1:i>255&&(i=255),e[z[c]]=i;for(j=[17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99],k=0;64>k;k++)l=d((j[k]*a+50)/100),1>l?l=1:l>255&&(l=255),f[z[k]]=l;for(m=[1,1.387039845,1.306562965,1.175875602,1,.785694958,.5411961,.275899379],n=0,o=0;8>o;o++)for(p=0;8>p;p++)g[n]=1/(8*e[z[n]]*m[o]*m[p]),h[n]=1/(8*f[z[n]]*m[o]*m[p]),n++}function J(a,b){var f,g,c=0,d=0,e=new Array;for(f=1;16>=f;f++){for(g=1;g<=a[f];g++)e[b[d]]=[],e[b[d]][0]=c,e[b[d]][1]=f,d++,c++;c*=2}return e}function K(){i=J(A,B),j=J(E,F),k=J(C,D),l=J(G,H)}function L(){var c,d,e,a=1,b=2;for(c=1;15>=c;c++){for(d=a;b>d;d++)n[32767+d]=c,m[32767+d]=[],m[32767+d][1]=c,m[32767+d][0]=d;for(e=-(b-1);-a>=e;e++)n[32767+e]=c,m[32767+e]=[],m[32767+e][1]=c,m[32767+e][0]=b-1+e;a<<=1,b<<=1}}function M(){for(var a=0;256>a;a++)x[a]=19595*a,x[a+256>>0]=38470*a,x[a+512>>0]=7471*a+32768,x[a+768>>0]=-11059*a,x[a+1024>>0]=-21709*a,x[a+1280>>0]=32768*a+8421375,x[a+1536>>0]=-27439*a,x[a+1792>>0]=-5329*a}function N(a){for(var b=a[0],c=a[1]-1;c>=0;)b&1<<c&&(r|=1<<s),c--,s--,0>s&&(255==r?(O(255),O(0)):O(r),s=7,r=0)}function O(a){q.push(w[a])}function P(a){O(255&a>>8),O(255&a)}function Q(a,b){var c,d,e,f,g,h,i,j,l,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,$,_,k=0;const m=8,n=64;for(l=0;m>l;++l)c=a[k],d=a[k+1],e=a[k+2],f=a[k+3],g=a[k+4],h=a[k+5],i=a[k+6],j=a[k+7],p=c+j,q=c-j,r=d+i,s=d-i,t=e+h,u=e-h,v=f+g,w=f-g,x=p+v,y=p-v,z=r+t,A=r-t,a[k]=x+z,a[k+4]=x-z,B=.707106781*(A+y),a[k+2]=y+B,a[k+6]=y-B,x=w+u,z=u+s,A=s+q,C=.382683433*(x-A),D=.5411961*x+C,E=1.306562965*A+C,F=.707106781*z,G=q+F,H=q-F,a[k+5]=H+D,a[k+3]=H-D,a[k+1]=G+E,a[k+7]=G-E,k+=8;for(k=0,l=0;m>l;++l)c=a[k],d=a[k+8],e=a[k+16],f=a[k+24],g=a[k+32],h=a[k+40],i=a[k+48],j=a[k+56],I=c+j,J=c-j,K=d+i,L=d-i,M=e+h,N=e-h,O=f+g,P=f-g,Q=I+O,R=I-O,S=K+M,T=K-M,a[k]=Q+S,a[k+32]=Q-S,U=.707106781*(T+R),a[k+16]=R+U,a[k+48]=R-U,Q=P+N,S=N+L,T=L+J,V=.382683433*(Q-T),W=.5411961*Q+V,X=1.306562965*T+V,Y=.707106781*S,Z=J+Y,$=J-Y,a[k+40]=$+W,a[k+24]=$-W,a[k+8]=Z+X,a[k+56]=Z-X,k++;for(l=0;n>l;++l)_=a[l]*b[l],o[l]=_>0?0|_+.5:0|_-.5;return o}function R(){P(65504),P(16),O(74),O(70),O(73),O(70),O(0),O(1),O(1),O(0),P(1),P(1),O(0),O(0)}function S(a,b){P(65472),P(17),O(8),P(b),P(a),O(3),O(1),O(17),O(0),O(2),O(17),O(1),O(3),O(17),O(1)}function T(){var a,b;for(P(65499),P(132),O(0),a=0;64>a;a++)O(e[a]);for(O(1),b=0;64>b;b++)O(f[b])}function U(){var a,b,c,d,e,f,g,h;for(P(65476),P(418),O(0),a=0;16>a;a++)O(A[a+1]);for(b=0;11>=b;b++)O(B[b]);for(O(16),c=0;16>c;c++)O(C[c+1]);for(d=0;161>=d;d++)O(D[d]);for(O(1),e=0;16>e;e++)O(E[e+1]);for(f=0;11>=f;f++)O(F[f]);for(O(17),g=0;16>g;g++)O(G[g+1]);for(h=0;161>=h;h++)O(H[h])}function V(){P(65498),P(12),O(3),O(1),O(0),O(2),O(17),O(3),O(17),O(0),O(63),O(0)}function W(a,b,c,d,e){var h,l,o,q,r,s,t,u,v,w,f=e[0],g=e[240];const i=16,j=63,k=64;for(l=Q(a,b),o=0;k>o;++o)p[z[o]]=l[o];for(q=p[0]-c,c=p[0],0==q?N(d[0]):(h=32767+q,N(d[n[h]]),N(m[h])),r=63;r>0&&0==p[r];r--);if(0==r)return N(f),c;for(s=1;r>=s;){for(u=s;0==p[s]&&r>=s;++s);if(v=s-u,v>=i){for(t=v>>4,w=1;t>=w;++w)N(g);v=15&v}h=32767+p[s],N(e[(v<<4)+n[h]]),N(m[h]),s++}return r!=j&&N(f),c}function X(){var b,a=String.fromCharCode;for(b=0;256>b;b++)w[b]=a(b)}function Y(a){if(0>=a&&(a=1),a>100&&(a=100),y!=a){var b=0;b=50>a?Math.floor(5e3/a):Math.floor(200-2*a),I(b),y=a,console.log("Quality set to: "+a+"%")}}function Z(){var c,b=(new Date).getTime();a||(a=50),X(),K(),L(),M(),Y(a),c=(new Date).getTime()-b,console.log("Initialization "+c+"ms")}var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H;Math.round,d=Math.floor,e=new Array(64),f=new Array(64),g=new Array(64),h=new Array(64),m=new Array(65535),n=new Array(65535),o=new Array(64),p=new Array(64),q=[],r=0,s=7,t=new Array(64),u=new Array(64),v=new Array(64),w=new Array(256),x=new Array(2048),z=[0,1,5,6,14,15,27,28,2,4,7,13,16,26,29,42,3,8,12,17,25,30,41,43,9,11,18,24,31,40,44,53,10,19,23,32,39,45,52,54,20,22,33,38,46,51,55,60,21,34,37,47,50,56,59,61,35,36,48,49,57,58,62,63],A=[0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0],B=[0,1,2,3,4,5,6,7,8,9,10,11],C=[0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,125],D=[1,2,3,0,4,17,5,18,33,49,65,6,19,81,97,7,34,113,20,50,129,145,161,8,35,66,177,193,21,82,209,240,36,51,98,114,130,9,10,22,23,24,25,26,37,38,39,40,41,42,52,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,225,226,227,228,229,230,231,232,233,234,241,242,243,244,245,246,247,248,249,250],E=[0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0],F=[0,1,2,3,4,5,6,7,8,9,10,11],G=[0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,119],H=[0,1,2,3,17,4,5,33,49,6,18,65,81,7,97,113,19,34,50,129,8,20,66,145,161,177,193,9,35,51,82,240,21,98,114,209,10,22,36,52,225,37,241,23,24,25,26,38,39,40,41,42,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,130,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,226,227,228,229,230,231,232,233,234,242,243,244,245,246,247,248,249,250],this.encode=function(a,b){var d,e,f,m,n,o,p,y,z,A,B,C,D,E,F,G,H,I,J,K,c=(new Date).getTime();for(b&&Y(b),q=new Array,r=0,s=7,P(65496),R(),T(),S(a.width,a.height),U(),V(),d=0,e=0,f=0,r=0,s=7,this.encode.displayName="_encode_",m=a.data,n=a.width,o=a.height,p=4*n,z=0;o>z;){for(y=0;p>y;){for(D=p*z+y,E=D,F=-1,G=0,H=0;64>H;H++)G=H>>3,F=4*(7&H),E=D+G*p+F,z+G>=o&&(E-=p*(z+1+G-o)),y+F>=p&&(E-=y+F-p+4),A=m[E++],B=m[E++],C=m[E++],t[H]=(x[A]+x[B+256>>0]+x[C+512>>0]>>16)-128,u[H]=(x[A+768>>0]+x[B+1024>>0]+x[C+1280>>0]>>16)-128,v[H]=(x[A+1280>>0]+x[B+1536>>0]+x[C+1792>>0]>>16)-128;d=W(t,g,d,i,k),e=W(u,h,e,j,l),f=W(v,h,f,j,l),y+=32}z+=8}return s>=0&&(I=[],I[1]=s+1,I[0]=(1<<s+1)-1,N(I)),P(65497),J="data:image/jpeg;base64,"+btoa(q.join("")),q=[],K=(new Date).getTime()-c,console.log("Encoding time: "+K+"ms"),J},Z()}function getImageDataFromImage(a){var d,b="string"==typeof a?document.getElementById(a):a,c=document.createElement("canvas");return c.width=b.width,c.height=b.height,d=c.getContext("2d"),d.drawImage(b,0,0),d.getImageData(0,0,c.width,c.height)}

    /* megapix-image.js for IOS(iphone5+) drawImage画面扭曲修复  */
    !function(){function a(a){var d,e,b=a.naturalWidth,c=a.naturalHeight;return b*c>1048576?(d=document.createElement("canvas"),d.width=d.height=1,e=d.getContext("2d"),e.drawImage(a,-b+1,0),0===e.getImageData(0,0,1,1).data[3]):!1}function b(a,b,c){var e,f,g,h,i,j,k,d=document.createElement("canvas");for(d.width=1,d.height=c,e=d.getContext("2d"),e.drawImage(a,0,0),f=e.getImageData(0,0,1,c).data,g=0,h=c,i=c;i>g;)j=f[4*(i-1)+3],0===j?h=i:g=i,i=h+g>>1;return k=i/c,0===k?1:k}function c(a,b,c){var e=document.createElement("canvas");return d(a,e,b,c),e.toDataURL("image/jpeg",b.quality||.8)}function d(c,d,f,g){var m,n,o,p,q,r,s,t,u,v,w,h=c.naturalWidth,i=c.naturalHeight,j=f.width,k=f.height,l=d.getContext("2d");for(l.save(),e(d,l,j,k,f.orientation),m=a(c),m&&(h/=2,i/=2),n=1024,o=document.createElement("canvas"),o.width=o.height=n,p=o.getContext("2d"),q=g?b(c,h,i):1,r=Math.ceil(n*j/h),s=Math.ceil(n*k/i/q),t=0,u=0;i>t;){for(v=0,w=0;h>v;)p.clearRect(0,0,n,n),p.drawImage(c,-v,-t),l.drawImage(o,0,0,n,n,w,u,r,s),v+=n,w+=r;t+=n,u+=s}l.restore(),o=p=null}function e(a,b,c,d,e){switch(e){case 5:case 6:case 7:case 8:a.width=d,a.height=c;break;default:a.width=c,a.height=d}switch(e){case 2:b.translate(c,0),b.scale(-1,1);break;case 3:b.translate(c,d),b.rotate(Math.PI);break;case 4:b.translate(0,d),b.scale(1,-1);break;case 5:b.rotate(.5*Math.PI),b.scale(1,-1);break;case 6:b.rotate(.5*Math.PI),b.translate(0,-d);break;case 7:b.rotate(.5*Math.PI),b.translate(c,-d),b.scale(-1,1);break;case 8:b.rotate(-.5*Math.PI),b.translate(-c,0)}}function f(a){var b,c,d;if(window.Blob&&a instanceof Blob){if(b=new Image,c=window.URL&&window.URL.createObjectURL?window.URL:window.webkitURL&&window.webkitURL.createObjectURL?window.webkitURL:null,!c)throw Error("No createObjectURL function found to create blob url");b.src=c.createObjectURL(a),this.blob=a,a=b}a.naturalWidth||a.naturalHeight||(d=this,a.onload=function(){var b,c,a=d.imageLoadListeners;if(a)for(d.imageLoadListeners=null,b=0,c=a.length;c>b;b++)a[b]()},this.imageLoadListeners=[]),this.srcImage=a}f.prototype.render=function(a,b,e){var f,g,h,i,j,k,l,m,n,o,p;if(this.imageLoadListeners)return f=this,this.imageLoadListeners.push(function(){f.render(a,b,e)}),void 0;b=b||{},g=this.srcImage.naturalWidth,h=this.srcImage.naturalHeight,i=b.width,j=b.height,k=b.maxWidth,l=b.maxHeight,m=!this.blob||"image/jpeg"===this.blob.type,i&&!j?j=h*i/g<<0:j&&!i?i=g*j/h<<0:(i=g,j=h),k&&i>k&&(i=k,j=h*i/g<<0),l&&j>l&&(j=l,i=g*j/h<<0),n={width:i,height:j};for(o in b)n[o]=b[o];p=a.tagName.toLowerCase(),"img"===p?a.src=c(this.srcImage,n,m):"canvas"===p&&d(this.srcImage,a,n,m),"function"==typeof this.onrender&&this.onrender(a),e&&e()},this.MegaPixImage=f}();
       
});