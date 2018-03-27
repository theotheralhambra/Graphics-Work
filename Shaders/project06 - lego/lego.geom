#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable

layout( triangles )  in;
layout( triangle_strip, max_vertices=204 )  out;	// 204 vs 200??

uniform int   uLevel;
uniform float uQuantize;
uniform bool  uModelCoords;

// lighting stuff
in 		vec3 	vNormal[3];
out 	float 	gLightIntensity;
const 	vec3 	LightPos = vec3( 0., 10., 0. );

//vec3 V[3];
//vec3 CG;

vec3 Norm[3];
vec3 V0, V01, V02;
vec3 N0, N01, N02;

float Quantize( float f ) {
	f *= uQuantize;
	f += .5;		// round-off
	int fi = int( f );
	f = float( fi ) / uQuantize;
	return f;
}

vec3 QuantizeVec3( vec3 v ) {
	vec3 vv;
	vv.x = Quantize( v.x );
	vv.y = Quantize( v.y );
	vv.z = Quantize( v.z );
	return vv;
}

void ProduceVertex( float s, float t )
{
	vec3 v, n, tnorm;
	vec4 ECposition, tvert;
	
	// do lighting
	n = N0 + s*N01 + t*N02; // normalize???
	tnorm = QuantizeVec3( normalize( gl_NormalMatrix * n ) );	// the transformed normal
	gLightIntensity  = abs(  dot( normalize(LightPos), tnorm )  );
	
	// generate the vertex
	v = V0 + s*V01 + t*V02;
	tvert = vec4(v, 1.);
	if (!uModelCoords)
		tvert = gl_ModelViewMatrix * tvert;
	tvert.xyz = QuantizeVec3(tvert.xyz);
	if (uModelCoords)
		tvert = gl_ModelViewMatrix * tvert;
	//gLightIntensity  = abs(  dot( normalize(LightPos - tvert.xyz), tnorm )  );

	gl_Position = gl_ProjectionMatrix * tvert;
	EmitVertex();
}

void main() {

	V01 = ( gl_PositionIn[1] - gl_PositionIn[0] ).xyz;
	V02 = ( gl_PositionIn[2] - gl_PositionIn[0] ).xyz;
	V0  =   gl_PositionIn[0].xyz;
	
	Norm[0] = vNormal[0];
	Norm[1] = vNormal[1];
	Norm[2] = vNormal[2];

	if( dot( Norm[0], Norm[1] ) < 0. )		// needed??
		Norm[1] = -Norm[1];
		
	if( dot( Norm[0], Norm[2] ) < 0. )
		Norm[2] = -Norm[2];

	N0  = normalize( Norm[0] );
	N01 = normalize( Norm[1] - Norm[0] );
	N02 = normalize( Norm[2] - Norm[0] );
	
	int numLayers = 1 << uLevel;

	float dt = 1. / float( numLayers );

	float t_top = 1.;

	for( int it = 0; it < numLayers; it++ ) {
		float t_bot = t_top - dt;
		float smax_top = 1. - t_top;
		float smax_bot = 1. - t_bot;

		int nums = it + 1;
		float ds_top = smax_top / float( nums - 1 );
		float ds_bot = smax_bot / float( nums );

		float s_top = 0.;
		float s_bot = 0.;

		for( int is = 0; is < nums; is++ )
		{
			ProduceVertex( s_bot, t_bot );
			ProduceVertex( s_top, t_top );
			s_top += ds_top;
			s_bot += ds_bot;
		}

		ProduceVertex( s_bot, t_bot );
		EndPrimitive();

		t_top = t_bot;
		t_bot -= dt;
	}
}
