#version 400 compatibility

flat in vec3 gNf;
flat in vec3 gLf;
flat in vec3 gEf;
	
uniform float 	uKa, uKd, uKs;
uniform vec4 	uMaterialBaseColorBlue;
uniform vec4 	uMaterialBaseColorRed;
uniform vec4 	uMaterialBaseColorWhite;
uniform vec4 	uMaterialBaseColorPurple;
uniform vec4 	uSpecularColor;
uniform float 	uShininess;
uniform float 	uTime;
uniform bool 	uRed;
uniform bool 	uBlue;

vec4 starColors[] = vec4[]( vec4(1.,  0.,  0.,  1.), 		// red
							vec4(0.,  .7,  .95, 1.),		// blue
							vec4(0.,  1.,  0.,  1.),    	// green
							vec4(1.,  1.,  0.,  1.),		// yellow
							vec4(1.,  .5,  0.,  1.),		// orange
							vec4(1.,  1.,  1.,  1.),		// white
							vec4(0.,  0.,  1.,  1.),		// blue
							vec4(.45, .7,  0.,  1.),		
							vec4(.75, 0.,  .2,  1.),		
							vec4(1.,  1.,  1.,  1.) );   	// white
vec2 seed = vec2(gEf.x, gNf.z) / vec2(uTime, gLf.y);

float rand(vec2 co) {														// the famous glsl PRNG
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}							
							
void main() {
	
	vec4 MaterialBaseColor = uMaterialBaseColorWhite;						// determine condensed object color / base color
	if (uRed && uBlue) {
		MaterialBaseColor = uMaterialBaseColorPurple;
	} else if (uRed) {
		MaterialBaseColor = uMaterialBaseColorRed;
	} else if (uBlue) {
		MaterialBaseColor = uMaterialBaseColorBlue;
	}
	int rand = int(rand(seed) * 10);										// get a "random" number in [0..1] and use most significant digit i.e. [0..9]
	float blend = smoothstep( 0., 10., uTime);								// blend factor based on time (simplest implementation)
	vec4 colorBlend = mix( MaterialBaseColor, starColors[rand], blend );	// mix random color with base color
	
	vec3 Normal = normalize(gNf);											// get the lighting stuff from the vertex shader (by way of geometry shader)
	vec3 Light = normalize(gLf);
	vec3 Eye = normalize(gEf);

	vec4 ambient = uKa * colorBlend;//MaterialBaseColor;					// ambient lighting
	
	float d = max( dot(Normal,Light), 0. );
	vec4 diffuse = uKd * d * colorBlend;//MaterialBaseColor;				// diffuse lighting
	
	float s = 0.;
	if( dot(Normal,Light) > 0. ) {											// only do specular if the light can see the point
		vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec4 specular = uKs * s * uSpecularColor;								// specular lighting
	
	gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );	// put it all together to get the frag color
	
}
