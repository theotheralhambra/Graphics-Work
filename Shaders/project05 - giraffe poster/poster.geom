#version 400 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable

layout( triangles )  in;
layout( triangle_strip, max_vertices=200 )  out;

uniform float uShrink;
uniform float uY;
//in vec3 vNormal[3];

flat in vec3 vNf[3];
     in vec3 vNs[3];
flat in vec3 vLf[3];
     in vec3 vLs[3];
flat in vec3 vEf[3];
     in vec3 vEs[3];
	 in vec3 vXYZ[3];
	 
flat out vec3 gNf;
     out vec3 gNs;
flat out vec3 gLf;
     out vec3 gLs;
flat out vec3 gEf;
     out vec3 gEs;
	 out vec3 gXYZ;
	 out vec3 gPolygonCenter;
	 
vec3 V[3];
vec3 CG;

void ProduceVertex( int v ) {
	gNf = vNf[v];
	gNs = vNs[v];
	gLf = vLf[v];
	gLs = vLs[v];
	gEf = vEf[v];
	gEs = vEs[v];
	gXYZ = vXYZ[v];
	gPolygonCenter = CG;
		
	gl_Position = gl_ModelViewProjectionMatrix * vec4( CG + uShrink * ( V[v] - CG ), 1. );
	EmitVertex();
}



void
main()
{
	V[0]  =   gl_PositionIn[0].xyz;
	V[1]  =   gl_PositionIn[1].xyz;
	V[2]  =   gl_PositionIn[2].xyz;

	CG = ( V[0] + V[1] + V[2] ) / 3.;
	
	ProduceVertex( 0 );
	ProduceVertex( 1 );
	ProduceVertex( 2 );
}
