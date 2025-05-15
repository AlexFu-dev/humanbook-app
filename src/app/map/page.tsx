'use client';

import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import Layout from '@/components/Layout';
import ContactModal from '@/components/ContactModal';
import { supabase, type Contact } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Constants for node sizes and positioning
const NODE_SIZE = 80;
const INNER_CIRCLE_RADIUS = NODE_SIZE * 4;    // For node positioning
const MIDDLE_CIRCLE_RADIUS = NODE_SIZE * 7;    // For node positioning
const OUTER_CIRCLE_RADIUS = NODE_SIZE * 10;    // For node positioning

// Ring sizes (diameter = 2 * radius)
const RING_INNER_SIZE = INNER_CIRCLE_RADIUS * 2;
const RING_MIDDLE_SIZE = MIDDLE_CIRCLE_RADIUS * 2;
const RING_OUTER_SIZE = OUTER_CIRCLE_RADIUS * 2;

export default function MapPage() {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewport, setViewport] = useState({
    scale: 1,
    x: 0,
    y: 0,
    centerX: 0,
    centerY: 0
  });
  const [dimensions, setDimensions] = useState({
    width: 1000,
    height: 1000
  });

  // Add animation frame ref
  const animationFrameRef = useRef<number>();

  // Update viewport in animation frame
  const updateViewport = () => {
    if (networkInstanceRef.current) {
      try {
        const network = networkInstanceRef.current;
        // Check if network is properly initialized and has the view object
        if (!network || !network.getViewPosition) {
          return;
        }

        const position = network.getViewPosition();
        const scale = network.getScale();
        
        // Get the canvas position of the central node
        const positions = network.getPositions(['me']);
        if (!positions || !positions['me']) {
          return;
        }
        const centerNodePosition = positions['me'];
        
        // Convert the node position to screen coordinates
        const centerPoint = network.canvasToDOM({
          x: centerNodePosition.x,
          y: centerNodePosition.y
        });

        setViewport({
          scale,
          x: position.x,
          y: position.y,
          centerX: centerPoint.x,
          centerY: centerPoint.y
        });
      } catch (error) {
        console.error('Error updating viewport:', error);
        return;
      }
      animationFrameRef.current = requestAnimationFrame(updateViewport);
    }
  };

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Set initial dimensions
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    if (!networkRef.current) {
      console.error('Network container ref not found');
      return;
    }

    async function initializeNetwork() {
      try {
        // Fetch all contacts
        const { data: contacts, error } = await supabase
          .from('contacts')
          .select('*')
          .order('name');

        if (error) {
          toast.error('Failed to fetch contacts');
          return;
        }

        // Separate contacts by intimacy level
        const closeContacts = contacts.filter(c => c.intimacy === 'Close Contact');
        const regularContacts = contacts.filter(c => c.intimacy === 'Regular Contact');
        const potentialContacts = contacts.filter(c => c.intimacy === 'Potential Contact');

        // Network configuration - defined first to apply to all nodes
        const options = {
          nodes: {
            fixed: true,
            shadow: {
              enabled: true,
              color: 'rgba(0,0,0,0.2)',
              size: 10,
              x: 5,
              y: 5
            },
            shape: 'circle',
            size: NODE_SIZE,
            font: {
              color: 'white',
              size: 18,
              face: 'Inter, system-ui, sans-serif',
              mod: 'bold',
              strokeWidth: 2,
              strokeColor: 'rgba(0,0,0,0.2)',
            },
            borderWidth: 3,
            borderWidthSelected: 4,
            chosen: true,
            scaling: {
              min: 1,
              max: 1
            }
          },
          groups: {
            ring: {
              shape: 'circle',
              borderWidth: 2,
              size: 3000,
              fixed: {
                size: true
              }
            }
          },
          edges: {
            smooth: {
              enabled: true,
              type: 'continuous',
              roundness: 0.5
            },
            color: {
              color: '#e2e8f0',
              opacity: 0.6,
              highlight: '#94a3b8',
            },
            width: 2,
            selectionWidth: 2,
            hoverWidth: 3,
            dashes: [6, 4],
          },
          interaction: {
            dragNodes: false,
            dragView: true,
            zoomView: true,
            tooltipDelay: 200,
            selectConnectedEdges: true,
            hoverConnectedEdges: true,
          },
          physics: false,
          autoResize: true,
          configure: {
            enabled: false
          },
          layout: {
            improvedLayout: true
          }
        };

        // Function to create node data
        const createNodeData = (
          contact: Contact, 
          index: number, 
          total: number, 
          radius: number, 
          isCloseContact: boolean,
          angleOffset: number = 0
        ) => {
          const angle = (2 * Math.PI * index) / total + angleOffset;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          // Format label to fit in node
          const label = contact.name;
          const title = [
            `<div style="font-weight: bold; font-size: 14px; color: #1e293b; margin-bottom: 4px;">
              ${contact.name}
            </div>`,
            contact.company && 
              `<div style="color: #64748b; margin-bottom: 2px;">
                ${contact.company}
              </div>`,
            contact.contact && 
              `<div style="color: #64748b; margin-bottom: 2px;">
                📧 ${contact.contact}
              </div>`,
            contact.tags && 
              `<div style="color: #3b82f6; font-size: 12px; margin-top: 4px;">
                ${contact.tags.split(',').map((tag: string) => `#${tag.trim()}`).join(' ')}
              </div>`,
            `<div style="color: #94a3b8; font-size: 11px; margin-top: 8px; font-style: italic;">
              Click for more details
            </div>`
          ].filter(Boolean).join('');

          let nodeColors;
          if (isCloseContact) {
            nodeColors = {
              background: 'rgb(22, 163, 74)',  // green-600
              border: 'rgb(21, 128, 61)',      // green-700
              highlight: {
                background: 'rgb(34, 197, 94)', // green-500
                border: 'rgb(22, 163, 74)'      // green-600
              },
              hover: {
                background: 'rgb(34, 197, 94)', // green-500
                border: 'rgb(22, 163, 74)'      // green-600
              }
            };
          } else if (radius === OUTER_CIRCLE_RADIUS) {
            nodeColors = {
              background: 'rgb(124, 58, 237)',  // violet-600
              border: 'rgb(109, 40, 217)',      // violet-700
              highlight: {
                background: 'rgb(139, 92, 246)', // violet-500
                border: 'rgb(124, 58, 237)'      // violet-600
              },
              hover: {
                background: 'rgb(139, 92, 246)', // violet-500
                border: 'rgb(124, 58, 237)'      // violet-600
              }
            };
          } else {
            nodeColors = {
              background: 'rgb(79, 70, 229)',   // indigo-600
              border: 'rgb(67, 56, 202)',       // indigo-700
              highlight: {
                background: 'rgb(99, 102, 241)', // indigo-500
                border: 'rgb(79, 70, 229)'       // indigo-600
              },
              hover: {
                background: 'rgb(99, 102, 241)', // indigo-500
                border: 'rgb(79, 70, 229)'       // indigo-600
              }
            };
          }

          return {
            id: contact.id.toString(),
            label,
            title,
            color: nodeColors,
            x,
            y,
            fixed: true
          };
        };

        // Function to calculate optimal offset angles
        const calculateOptimalOffsets = (
          closeCount: number,
          regularCount: number,
          potentialCount: number
        ) => {
          // Base angle for each circle (in radians)
          const closeBaseAngle = closeCount > 0 ? (2 * Math.PI) / closeCount : 0;
          const regularBaseAngle = regularCount > 0 ? (2 * Math.PI) / regularCount : 0;
          const potentialBaseAngle = potentialCount > 0 ? (2 * Math.PI) / potentialCount : 0;

          // Function to calculate angles for all nodes in a circle
          const getAnglesForCircle = (count: number, baseAngle: number, offset: number) => {
            return Array.from({ length: count }, (_, i) => (i * baseAngle + offset) % (2 * Math.PI));
          };

          // Function to calculate minimum angular distance between two sets of angles
          const getMinAngularDistance = (angles1: number[], angles2: number[]) => {
            let minDistance = Infinity;
            
            for (const angle1 of angles1) {
              for (const angle2 of angles2) {
                const distance = Math.abs(angle1 - angle2) % (2 * Math.PI);
                minDistance = Math.min(minDistance, Math.min(distance, 2 * Math.PI - distance));
              }
            }
            
            return minDistance;
          };

          // Function to find optimal offset that maximizes minimum angular distance
          const findOptimalOffsets = () => {
            const steps = 72; // Increased precision: test every 5 degrees
            let bestRegularOffset = 0;
            let bestPotentialOffset = 0;
            let maxMinDistance = 0;

            // Try all combinations of offsets
            for (let i = 0; i < steps; i++) {
              const regularOffset = (i * 2 * Math.PI) / steps;
              
              for (let j = 0; j < steps; j++) {
                const potentialOffset = (j * 2 * Math.PI) / steps;
                
                // Get all node angles for each circle
                const closeAngles = getAnglesForCircle(closeCount, closeBaseAngle, 0);
                const regularAngles = getAnglesForCircle(regularCount, regularBaseAngle, regularOffset);
                const potentialAngles = getAnglesForCircle(potentialCount, potentialBaseAngle, potentialOffset);

                // Calculate minimum distances between all circles
                const minDistanceClose2Regular = closeCount && regularCount ? 
                  getMinAngularDistance(closeAngles, regularAngles) : Infinity;
                const minDistanceClose2Potential = closeCount && potentialCount ? 
                  getMinAngularDistance(closeAngles, potentialAngles) : Infinity;
                const minDistanceRegular2Potential = regularCount && potentialCount ? 
                  getMinAngularDistance(regularAngles, potentialAngles) : Infinity;

                // Get the smallest angular gap among all combinations
                const minDistance = Math.min(
                  minDistanceClose2Regular,
                  minDistanceClose2Potential,
                  minDistanceRegular2Potential
                );

                // Update best offsets if we found a larger minimum distance
                if (minDistance > maxMinDistance) {
                  maxMinDistance = minDistance;
                  bestRegularOffset = regularOffset;
                  bestPotentialOffset = potentialOffset;
                }
              }
            }

            return {
              closeOffset: 0,
              regularOffset: bestRegularOffset,
              potentialOffset: bestPotentialOffset
            };
          };

          // Calculate and return optimal offsets
          return findOptimalOffsets();
        };

        // Calculate optimal offsets based on number of nodes in each circle
        const offsets = calculateOptimalOffsets(
          closeContacts.length,
          regularContacts.length,
          potentialContacts.length
        );

        // Create nodes array starting with center node
        const nodes = [
          // Center node
          {
            id: 'me',
            label: 'Me',
            title: 'Central User',
            color: {
              background: 'rgb(37, 99, 235)',
              border: 'rgb(29, 78, 216)',
              highlight: {
                background: 'rgb(59, 130, 246)',
                border: 'rgb(37, 99, 235)'
              },
              hover: {
                background: 'rgb(59, 130, 246)',
                border: 'rgb(37, 99, 235)'
              }
            },
            x: 0,
            y: 0,
            fixed: true
          }
        ];

        // Add close contacts to inner ring
        closeContacts.forEach((contact, index) => {
          nodes.push(createNodeData(
            contact, 
            index, 
            closeContacts.length, 
            INNER_CIRCLE_RADIUS, 
            true,
            offsets.closeOffset
          ));
        });

        // Add regular contacts to middle ring with optimal offset
        regularContacts.forEach((contact, index) => {
          nodes.push(createNodeData(
            contact, 
            index, 
            regularContacts.length, 
            MIDDLE_CIRCLE_RADIUS, 
            false,
            offsets.regularOffset
          ));
        });

        // Add potential contacts to the outer ring with optimal offset
        potentialContacts.forEach((contact, index) => {
          nodes.push(createNodeData(
            contact, 
            index, 
            potentialContacts.length, 
            OUTER_CIRCLE_RADIUS,
            false,
            offsets.potentialOffset
          ));
        });

        // Create edges connecting to center
        const edges = [...closeContacts, ...regularContacts, ...potentialContacts].map(contact => ({
          from: 'me',
          to: contact.id.toString(),
        }));

        console.log('Creating network with:', { nodes, edges, options });
        
        // Create the network
        if (!networkRef.current) return;
        
        const network = new Network(
          networkRef.current,
          { nodes, edges },
          options
        );

        // Handle node clicks
        network.on('click', async function(params) {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            if (nodeId === 'me') return;

            // Fetch the latest contact data
            const { data } = await supabase
              .from('contacts')
              .select('*')
              .eq('id', nodeId)
              .single();

            if (data) {
              setSelectedContact(data);
              setIsModalOpen(true);
            }
          }
        });

        // Handle zoom/pan events to update SVG viewport
        network.on('zoom', function(params) {
          setViewport(prev => ({
            ...prev,
            scale: network.getScale()
          }));
        });

        network.on('dragEnd', function(params) {
          const position = network.getViewPosition();
          setViewport(prev => ({
            ...prev,
            x: position.x,
            y: position.y
          }));
        });

        networkInstanceRef.current = network;

        // Wait for network to be ready before starting animation frame
        network.once('afterDrawing', () => {
          console.log('Network drawn, starting viewport updates...');
          // Start animation frame updates
          updateViewport();
          
          network.fit({
            animation: {
              duration: 1000,
              easingFunction: 'easeInOutQuad'
            }
          });
        });

        console.log('Network initialized successfully');
      } catch (error) {
        console.error('Error creating network:', error);
      }
    }

    initializeNetwork();

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
        networkInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <Layout>
      <div className="relative w-full h-[calc(100vh-4rem)]">
        {/* SVG Rings */}
        <svg 
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          style={{ 
            background: 'linear-gradient(135deg, rgb(241 245 249 / 0.9), rgb(248 250 252 / 0.9))'
          }}
        >
          <g transform={`translate(${viewport.centerX}, ${viewport.centerY}) scale(${viewport.scale})`}>
            {/* Inner ring (Close Contacts) */}
            <circle
              cx={0}
              cy={0}
              r={INNER_CIRCLE_RADIUS}
              fill="rgba(22, 163, 74, 0.15)"
              stroke="rgba(21, 128, 61, 1)"
              strokeWidth={2 / viewport.scale}
            />
            {/* Middle ring (Regular Contacts) */}
            <circle
              cx={0}
              cy={0}
              r={MIDDLE_CIRCLE_RADIUS}
              fill="rgba(79, 70, 229, 0.15)"
              stroke="rgba(67, 56, 202, 1)"
              strokeWidth={2 / viewport.scale}
            />
            {/* Outer ring (Potential Contacts) */}
            <circle
              cx={0}
              cy={0}
              r={OUTER_CIRCLE_RADIUS}
              fill="rgba(124, 58, 237, 0.15)"
              stroke="rgba(109, 40, 217, 1)"
              strokeWidth={2 / viewport.scale}
            />
          </g>
        </svg>

        {/* Network visualization container */}
        <div 
          ref={networkRef} 
          className="absolute inset-0 w-full h-full z-10"
        />

        {/* Contact modal */}
        <ContactModal
          contact={selectedContact}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContact(null);
          }}
        />
      </div>
    </Layout>
  );
} 