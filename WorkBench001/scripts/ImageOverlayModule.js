/***************************************************************
* Image Overlay Module
*
* Author: Ricky Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: Feb 7th, 2013
* 
* This module creates a class called ImageOverlay. This class 
* allows you to stretch an image over the map for a given 
* bounding box. 
*
*
* Classes:
* --------
* 
* ImageOverlay 
*
* An EntityCollection modified to render Canvas pushpins after 
* then have been added to the collection. The constructor takes 
* in a reference to the map, a URL to the image to overlay and a 
* LocationRect object that has the bounding box information to 
* strech to image to. 
*
*   Usage: 
*
*   var imageRect = Microsoft.Maps.LocationRect.fromCorners(new Microsoft.Maps.Location(40.5, -123.5), new Microsoft.Maps.Location(40, -123));
*   var imgPin = ImageOverlay(map, 'images/topographicMap.gif', imageRect);
*   map.entities.push(imgPin);
*
* Methods:
* -------
*
* SetOptacity - Allows you to set the opacity/transparency of the 
*               image overlay. Use values between 0 and 1.
*
* Example: imgPin.SetOpacity(0.5);
*
* Known Issues:
* ------------
* 
* Since this is based on the pushpin class it is subject to the 
* optimizations used in the map that hide pushpins that are not 
* in view. This only becomes an issue when the image is strached 
* over a large area and the center of the image is a is 
* significantly out of view. 
*
****************************************************************/

var ImageOverlay;

(function () {
    var canvasIdNumber = 0;

    function generateUniqueID() {
        var canvasID = 'strechedImg' + canvasIdNumber;
        canvasIdNumber++;

        if (window[canvasID]) {
            return generateUniqueID();
        }

        return canvasID;
    }

    // map - Microsoft.Maps.Map object
    // imageURL - String URL to where the image is located
    // boundingBox - Microsoft.Maps.LocationRect object
    ImageOverlay = function (map, imageURL, boundingBox) {
        var _basePushpin = new Microsoft.Maps.Pushpin(boundingBox.center);
        var _opacity = 1;
        var _id = generateUniqueID();

        function render(){
            var size = calculateSize();

            var pushpinOptions = {
                width: null,
                height: null,
                anchor: new Microsoft.Maps.Point(size.anchorPointX, size.anchorPointY),
                htmlContent: "<div style='margin-left:" + size.offSetX + "px;margin-top:" + size.offSetY + "px;'>" + 
							 "<img id='" + _id + "' style='width:" + size.width + "px;height:" + size.height + "px;opacity:" + _opacity + ";filter:alpha(opacity=" + (_opacity * 100) + ");' src='" + imageURL + "'/>" + 
							 "</div>"
            };

            _basePushpin.setOptions(pushpinOptions);
        }

        function calculateSize(){
            var nwOverlayPixel = map.tryLocationToPixel(boundingBox.getNorthwest());
            var seOverlayPixel = map.tryLocationToPixel(boundingBox.getSoutheast());
			
			var mapLocationRect = map.getBounds(); 
			var nwMapPixel = map.tryLocationToPixel(mapLocationRect.getNorthwest());
            var seMapPixel = map.tryLocationToPixel(mapLocationRect.getSoutheast());

            var width = Math.abs(seOverlayPixel.x - nwOverlayPixel.x);
            var height = Math.abs(nwOverlayPixel.y - seOverlayPixel.y);
			
			var anchorPointX = width / 2;
			var anchorPointY = height / 2;
			var offSetX = 0;
			var offSetY = 0;
			
			if (!mapLocationRect.contains(boundingBox.getNorthwest()) || !mapLocationRect.contains(boundingBox.getSoutheast()))
			{
			   anchorPointX
			   anchorPointY
			}

            return {
                width: width,
                height: height,
				anchorPointX: anchorPointX,
				anchorPointY: anchorPointY,
				offSetX: offSetX,
				offSetY: offSetY 
            };
        }

        _basePushpin.Refresh = function () {
            var size = calculateSize();

            _basePushpin.setOptions({anchor : new Microsoft.Maps.Point(size.anchorPointX, size.anchorPointY)});

            var elm = document.getElementById(_id);

            if(elm){ // IMG elem
                elm.style.width = size.width + 'px';
                elm.style.height = size.height + 'px';   

				if (elm.parentNode) { // DIV elem
					elm.parentNode.style.marginLeft = size.offSetX + 'px';
					elm.parentNode.style.marginTop = size.offSetY + 'px'; 
				}				
            }
			
			
        };

        _basePushpin.SetOpacity = function (opacity) {
            if (opacity >= 0 || opctity <= 1) {
                _opacity = opacity;
                render();
            }
        };

        //Map view change event to resize the image
        Microsoft.Maps.Events.addHandler(map, 'viewchange', function (e) {
            if (!e.linear) {
                //Check if zoom level has changed. If it has then resize the pushpin image
                _basePushpin.Refresh();
            }
        });

        render();

        return _basePushpin;
    };
})();

//Call the Module Loaded method
Microsoft.Maps.moduleLoaded('ImageOverlayModule');