#version 400 compatibility

uniform float uLightX, uLightY, uLightZ;
uniform sampler3D Noise3;

flat out vec3 vNf;
flat out vec3 vLf;
flat out vec3 vEf;
	 
const float PI = 3.14159265359;
vec4 currVertex = gl_Vertex;

void main()	{
	
	// get the normal
    vec3 currNorm = normalize( gl_NormalMatrix * gl_Normal );
	
	// figure out lighting stuff
	vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );	// composite light position
	vec3 ECposition = vec3( gl_ModelViewMatrix * gl_Vertex );
	
	vNf = normalize( gl_NormalMatrix * currNorm);				// surface normal vector
	vLf = eyeLightPosition - ECposition.xyz;					// vector from the point
																// to the light position
	vEf = vec3( 0., 0., 0. ) - ECposition.xyz;					// vector from the point
																// to the eye position 
		
   	gl_Position = gl_ModelViewMatrix * gl_Vertex;
}
