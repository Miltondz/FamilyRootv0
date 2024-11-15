import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import MemberNode from '../components/MemberNode';
import MemberForm from '../components/MemberForm';
import { Plus, AlertCircle } from 'lucide-react';

type FamilyMember = Database['public']['Tables']['family_members']['Row'];

const nodeTypes = {
  member: MemberNode,
};

// Dagre graph configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 250;
const NODE_HEIGHT = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  // Clear the graph before adding new nodes
  dagreGraph.nodes().forEach(node => dagreGraph.removeNode(node));
  
  // Add nodes to dagre graph
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to dagre graph
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Layout the graph
  dagre.layout(dagreGraph);

  // Get the layout and create the new nodes
  const layoutedNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Convert family members to nodes and edges
const createGraphElements = (members: FamilyMember[]) => {
  const nodes: Node[] = members.map(member => ({
    id: member.id,
    type: 'member',
    position: { x: 0, y: 0 }, // Initial position, will be calculated by dagre
    data: member,
  }));

  const edges: Edge[] = [];
  members.forEach(member => {
    member.parent_ids?.forEach(parentId => {
      edges.push({
        id: `${parentId}-${member.id}`,
        source: parentId,
        target: member.id,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#059669' },
      });
    });
  });

  return getLayoutedElements(nodes, edges, 'BT'); // Bottom to Top direction
};

export default function TreeView() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const loadTreeData = useCallback(async () => {
    if (!treeId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data: members, error: fetchError } = await supabase
        .from('family_members')
        .select('*')
        .eq('tree_id', treeId);

      if (fetchError) throw fetchError;

      if (members) {
        setMembers(members);
        const { nodes: layoutedNodes, edges: layoutedEdges } = createGraphElements(members);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }
    } catch (err) {
      console.error('Error loading tree:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [treeId, setNodes, setEdges]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadTreeData();
  }, [user, loadTreeData, navigate]);

  const handleSaveMember = async (memberData: Partial<FamilyMember>) => {
    try {
      setError(null);
      if (!treeId) throw new Error('No tree ID provided');

      const data = {
        ...memberData,
        tree_id: treeId,
      };

      let savedMember;
      if (selectedMember) {
        // Update existing member
        const { data: updated, error } = await supabase
          .from('family_members')
          .update(data)
          .eq('id', selectedMember.id)
          .select()
          .single();

        if (error) throw error;
        savedMember = updated;
      } else {
        // Create new member without specifying an ID
        const { data: created, error } = await supabase
          .from('family_members')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        savedMember = created;
      }

      if (savedMember) {
        setMembers(prev => {
          const filtered = prev.filter(m => m.id !== savedMember!.id);
          return [...filtered, savedMember!];
        });

        const updatedMembers = members.filter(m => m.id !== savedMember.id).concat(savedMember);
        const { nodes: layoutedNodes, edges: layoutedEdges } = createGraphElements(updatedMembers);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        setNotification({
          type: 'success',
          message: `Successfully ${selectedMember ? 'updated' : 'added'} family member`
        });
      }

      setIsFormOpen(false);
      setSelectedMember(null);
    } catch (err) {
      console.error('Error saving member:', err);
      setError(err instanceof Error ? err.message : 'Error saving member');
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const member = members.find(m => m.id === node.id);
    if (member) {
      setSelectedMember(member);
      setIsFormOpen(true);
    }
  }, [members]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 rounded-md p-4 ${
          notification.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className={`flex-shrink-0 ${
              notification.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute right-4 top-20 z-10 space-y-2">
        <button
          onClick={() => {
            setSelectedMember(null);
            setIsFormOpen(true);
            setError(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Member
        </button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>

      {isFormOpen && (
        <MemberForm
          treeId={treeId!}
          member={selectedMember}
          members={members}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedMember(null);
            setError(null);
          }}
          onSave={handleSaveMember}
        />
      )}
    </div>
  );
}