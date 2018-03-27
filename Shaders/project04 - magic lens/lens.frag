#version 330 compatibility

uniform sampler2D uTexUnit;
uniform float uScenter;
uniform float uTcenter;
uniform float uRadius;
uniform float uMagFactor;
uniform float uRotAngle;
uniform float uSharpFactor;

in vec2 vST;

vec2 dimensions = textureSize(uTexUnit, 0);
float sizeS = dimensions.s;
float sizeT = dimensions.t;

vec2 magnifyImage( float sOffset, float tOffset ) {
	
	// remove the separation between pt and center of lens, 
	// then add back that distance adjusted for magnification
    // (divide produces magnification)
	float s1 = vST.s - sOffset + (sOffset / uMagFactor);
	float t1 = vST.t - tOffset + (tOffset / uMagFactor);
	
	// return the point if within original texture, i.e. avoid tiling for 1. < s,t < 0.
	if (s1 >= 0. && s1 <= 1. && t1 >= 0. && t1 <= 1.) {
		return vec2(s1 , t1 );
	} else {
		return vec2(0., 0.);
	}
	
}

vec2 rotateImage( vec2 currST, float sDist, float tDist ) {
		
	// rotate using dist from center to produce rotation with respect to center
	float s1 = ( sDist * -1. * cos(uRotAngle) - tDist * -1. * sin(uRotAngle) + uScenter );
	float t1 = ( sDist * -1. * sin(uRotAngle) + tDist * -1. * cos(uRotAngle) + uTcenter );
	return vec2(s1, t1);
	
}

vec3 sharpenImage( vec3 irgb, vec2 currST, float ResS, float ResT ) {
	
	// provided code. Author: Professor Mike Bailey, OSU
	vec2 stp0  = vec2( 1. / ResS,  0. ); 
	vec2 st0p  = vec2( 0.,  1. / ResT ); 
	vec2 stpp  = vec2( 1. / ResS,  1. / ResT ); 
	vec2 stpm  = vec2( 1. / ResS, -1. / ResT ); 
	vec3 i00   = texture2D( uTexUnit, currST ).rgb; 
	vec3 im1m1 = texture2D( uTexUnit, currST - stpp ).rgb; 
	vec3 ip1p1 = texture2D( uTexUnit, currST + stpp ).rgb; 
	vec3 im1p1 = texture2D( uTexUnit, currST - stpm ).rgb; 
	vec3 ip1m1 = texture2D( uTexUnit, currST + stpm ).rgb; 
	vec3 im10  = texture2D( uTexUnit, currST - stp0 ).rgb; 
	vec3 ip10  = texture2D( uTexUnit, currST + stp0 ).rgb; 
	vec3 i0m1  = texture2D( uTexUnit, currST - st0p ).rgb; 
	vec3 i0p1  = texture2D( uTexUnit, currST + st0p ).rgb; 
	vec3 target = vec3(0.,0.,0.); 
	target += 1. * ( im1m1 + ip1m1 + ip1p1  + im1p1 ); 
	target += 2. * ( im10 + ip10 + i0m1 + i0p1 ); 
	target += 4. * ( i00 ); target /= 16.; 
	return vec3( mix( target, irgb, uSharpFactor ) );
	
}

void main() {
	
	vec3 rgb;
	vec2 newST;
	float a = vST.s - uScenter;	
	float a1;
	float a2 = pow( a, 2);
	float b = vST.t - uTcenter;
	float b1;
	float b2 = pow( b, 2);
	float c2 = a2 + b2;
	float r2 = pow(uRadius, 2);

	if( c2 <= r2 ) {
		newST = magnifyImage(a, b);					// do magnification
		a1 = uScenter - newST.s;					// find new dist from center
		b1 = uTcenter - newST.t;
		newST = rotateImage(newST, a1, b1);			//do rotation
		rgb = sharpenImage( texture2D( uTexUnit, newST ).rgb, newST, sizeS, sizeT );
	} else {
		rgb = texture2D( uTexUnit, vST ).rgb;
	}

	gl_FragColor = vec4( rgb, 1. );
}
