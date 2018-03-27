#version 400 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable

layout( triangles )  in;
layout( points, max_vertices=200 )  out;

uniform int 	uLevel;
uniform float 	uTime;
uniform float 	uVelScale;

flat in vec3 vNf[3];
flat in vec3 vLf[3];
flat in vec3 vEf[3];
	 
flat out vec3 gNf;
flat out vec3 gLf;
flat out vec3 gEf;

vec3	V0, V01, V02;	 
vec3 	V[3];
vec3 	CG;

/*
* even though the geometry is done with a series of points, in order to get a flat-shading model
* we have to do the normals per-vertex here so they can eventually become per-face in frag shader
*/
void DoLighting( int v ) {
	gNf = vNf[v];
	gLf = vLf[v];
	gEf = vEf[v];
}

/*
* turns triangles into a series of points and then adjusts those points for motion effect
* the number of points is based on the parameter uLevel (i.e. how many "layers" per triangle)
*/
void ProduceVertex( float s, float t ) {
	vec3 v = V0 + s*V01 + t*V02;						// convert triangle into a series of points
	vec3 vel = uVelScale * ( v - CG );					// determine initial particle velocity based on distance from center
	v = v + vel*uTime + 0.5*vec3(0.,0.,0.)*uTime*uTime; // adjust the particle's position based on velocity and elapsed time
	gl_Position = gl_ProjectionMatrix * vec4( v, 1. );	// multiplied by ModelViewMatrix in vertex shader
	EmitVertex( );										// send it
}

void main() {

	for (int i = 0; i < 3; i++) {						// output the lighting for each vertex in the triangle
		DoLighting(i);
	}
		
	V01 = ( gl_PositionIn[1] - gl_PositionIn[0] ).xyz;	// find origin, center and vectors
	V02 = ( gl_PositionIn[2] - gl_PositionIn[0] ).xyz;
	V0  =   gl_PositionIn[0].xyz;
	CG = ( gl_PositionIn[0].xyz + gl_PositionIn[1].xyz + gl_PositionIn[2].xyz ) / 3.;

	int numLayers = 1 << uLevel;						// figure out how many times todivide the triangle

	float dt = 1. / float( numLayers );
	float t = 1.;

	for( int it = 0; it <= numLayers; it++ ) {			// iterate through the layers and generate points
		float smax = 1. - t;
		int nums = it + 1;
		float ds = smax / float( nums - 1 );
		float s = 0.;

		for( int is = 0; is < nums; is++ ) {
			ProduceVertex( s, t );
			s += ds;
		}
		t -= dt;
	}
	
}
