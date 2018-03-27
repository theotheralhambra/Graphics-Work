#version 330 compatibility

out vec4  	vColor;
out vec2  	vST;
out vec3 	N;
out vec3 	L;
out vec3 	E;

uniform float uWaveAmpK;
uniform float uWavePeriodP;
uniform vec4  uMaterialColor;
uniform vec4  uLightColor;
uniform float uLightX, uLightY, uLightZ;

const vec3 LIGHTPOS = vec3( 0., 0., 10. );
const float Y0 = 1.;								//top of the curtain -- point of 0 z-displacement
const float PI = 3.14159265359;

vec4 newVertex = gl_Vertex;
vec4 color = uLightColor * uMaterialColor;
vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );

float calculateWave(){
	//equation: z = K * (Y0-y) * sin( 2.*PI*x/P )
	return uWaveAmpK * ( Y0 - gl_Vertex.y ) * sin( 2 * PI * gl_Vertex.x / uWavePeriodP );
}

void main( ){
	newVertex.z = calculateWave();
	vec3 ECposition = ( gl_ModelViewMatrix * newVertex ).xyz;
	
	N = normalize( gl_NormalMatrix * gl_Normal );				// surface normal vector
	L = eyeLightPosition - ECposition.xyz;						// vector from the point to the light position
	E = vec3( 0., 0., 0. ) - ECposition.xyz;					// vector from the point to the eye position 

	vColor = gl_Color;
	vST = gl_MultiTexCoord0.st;
	gl_Position = gl_ModelViewProjectionMatrix * newVertex;
}
